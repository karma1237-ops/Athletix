import { useState, useEffect } from "react";
import { AdminLayout } from "./Dashboard";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";

const STATUTS = {
  en_attente: { label: "En attente", bg: "rgba(245,158,11,0.2)", color: "#f59e0b" },
  validee:    { label: "Validée",    bg: "rgba(59,130,246,0.2)",  color: "#3b82f6" },
  expediee:   { label: "Expédiée",   bg: "rgba(16,185,129,0.2)",  color: "#10b981" },
  livree:     { label: "Livrée",     bg: "rgba(107,114,128,0.2)", color: "#9ca3af" },
};

export default function GestionCommandes() {
  const { accessToken } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [search, setSearch]       = useState("");
  const [filterStatut, setFilter] = useState("tous");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(null); // null | { commande }
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const data = await adminService.getCommandes(accessToken);
      setCommandes(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (accessToken) load(); }, [accessToken]);

  const handleStatutChange = async (id, statut) => {
    setSaving(true);
    try {
      await adminService.updateStatutCommande(accessToken, id, statut);
      showToast("Statut mis à jour !");
      await load();
      if (modal) setModal(prev => ({ ...prev, commande: { ...prev.commande, statut } }));
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const filtered = commandes.filter(c => {
    const clientName = c.client ? `${c.client.prenom} ${c.client.nom}`.toLowerCase() : "";
    const matchSearch = `cmd-${c.id_commande}`.includes(search.toLowerCase()) ||
      clientName.includes(search.toLowerCase()) ||
      c.client?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <AdminLayout current="/admin/commandes">
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#ef4444" : "#10b981" }}>
          {toast.msg}
        </div>
      )}

      <div style={s.header}>
        <h1 style={s.pageTitle}>Gestion des Commandes</h1>
        <span style={s.count}>{filtered.length} commande{filtered.length > 1 ? "s" : ""}</span>
      </div>

      <div style={s.toolbar}>
        <input type="text" placeholder="Rechercher (n° commande, client…)" style={s.searchInput}
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.selectFilter} value={filterStatut} onChange={e => setFilter(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {error && <div style={s.errorBanner}>⚠️ {error}</div>}

      <div style={{ marginTop: "24px", ...s.tableContainer }}>
        {loading ? (
          <div style={s.loader}>Chargement…</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>N° Commande</th>
                <th style={s.th}>Client</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Total HT</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#666" }}>Aucune commande trouvée</td></tr>
              ) : filtered.map(c => {
                const st = STATUTS[c.statut] || STATUTS.en_attente;
                return (
                  <tr key={c.id_commande} style={s.row}>
                    <td style={s.td}><strong>CMD-{c.id_commande}</strong></td>
                    <td style={s.td}>
                      {c.client ? (
                        <div>
                          <div style={{ color: "#fff", fontWeight: "500" }}>{c.client.prenom} {c.client.nom}</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>{c.client.email}</div>
                        </div>
                      ) : <span style={{ color: "#666" }}>Client supprimé</span>}
                    </td>
                    <td style={s.td}>{c.date_commande ? new Date(c.date_commande).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={s.td}><strong>{Number(c.montant_hors_taxe_commande || 0).toFixed(2)} €</strong></td>
                    <td style={s.td}>
                      <span style={{ ...s.statBadge, background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.actionBtn} onClick={() => setModal({ commande: c })}>
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal détail commande */}
      {modal && (() => {
        const c = modal.commande;
        const st = STATUTS[c.statut] || STATUTS.en_attente;
        return (
          <div style={s.overlay} onClick={() => setModal(null)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <h2 style={s.modalTitle}>Commande CMD-{c.id_commande}</h2>
                <button style={s.closeBtn} onClick={() => setModal(null)}>✕</button>
              </div>

              <div style={s.infoGrid}>
                <div style={s.infoBlock}>
                  <div style={s.infoLabel}>Client</div>
                  <div style={s.infoValue}>{c.client ? `${c.client.prenom} ${c.client.nom}` : "—"}</div>
                  {c.client?.email && <div style={{ fontSize: "12px", color: "#666" }}>{c.client.email}</div>}
                </div>
                <div style={s.infoBlock}>
                  <div style={s.infoLabel}>Date</div>
                  <div style={s.infoValue}>{c.date_commande ? new Date(c.date_commande).toLocaleDateString("fr-FR") : "—"}</div>
                </div>
                <div style={s.infoBlock}>
                  <div style={s.infoLabel}>Total HT</div>
                  <div style={{ ...s.infoValue, color: "#ff6600" }}>{Number(c.montant_hors_taxe_commande || 0).toFixed(2)} €</div>
                </div>
                <div style={s.infoBlock}>
                  <div style={s.infoLabel}>Statut actuel</div>
                  <span style={{ ...s.statBadge, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              </div>

              {/* Lignes commande */}
              {c.ligne_commandes?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>Articles</div>
                  {c.ligne_commandes.map((l, i) => (
                    <div key={i} style={s.ligneRow}>
                      <span style={{ color: "#ddd" }}>{l.produit?.nom || `Produit #${l.id_produit}`}</span>
                      <span style={{ color: "#888" }}>x{l.quantite}</span>
                      <span style={{ color: "#fff", fontWeight: "600" }}>{Number(l.prix * l.quantite).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Changer statut */}
              <div>
                <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>Changer le statut</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {Object.entries(STATUTS).map(([k, v]) => (
                    <button key={k}
                      style={{ padding: "8px 16px", borderRadius: "20px", border: `1.5px solid ${c.statut === k ? v.color : "rgba(255,255,255,0.1)"}`, background: c.statut === k ? v.bg : "transparent", color: c.statut === k ? v.color : "#666", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.15s" }}
                      onClick={() => handleStatutChange(c.id_commande, k)} disabled={saving || c.statut === k}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
}

const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";
const s = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  pageTitle: { fontFamily: FF, fontSize: "32px", letterSpacing: "2px", color: "#fff", margin: 0 },
  count: { color: "#666", fontSize: "14px" },
  toolbar: { display: "flex", alignItems: "center", gap: "12px" },
  searchInput: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#fff", width: "280px", fontSize: "14px", fontFamily: FB },
  selectFilter: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "14px", fontFamily: FB, cursor: "pointer" },
  tableContainer: { background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" },
  loader: { padding: "40px", textAlign: "center", color: "#666", fontFamily: FB },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "16px 20px", color: "#888", fontSize: "13px", fontWeight: "500", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  td: { padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#ddd", fontSize: "14px" },
  row: {},
  statBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  actionBtn: { padding: "7px 16px", background: "#ff6600", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: FB, fontWeight: "600" },
  errorBanner: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  modal: { background: "#1a1a1a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "600px", border: "1px solid rgba(255,255,255,0.1)", fontFamily: FB, maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontFamily: FF, fontSize: "24px", letterSpacing: "1px", color: "#fff", margin: 0 },
  closeBtn: { background: "transparent", border: "none", color: "#666", fontSize: "18px", cursor: "pointer", padding: "4px" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  infoBlock: { background: "#111", borderRadius: "10px", padding: "14px 16px" },
  infoLabel: { fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" },
  infoValue: { fontSize: "15px", fontWeight: "600", color: "#ddd" },
  ligneRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  toast: { position: "fixed", bottom: "24px", right: "24px", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", zIndex: 2000, fontSize: "14px", fontFamily: FB },
};
