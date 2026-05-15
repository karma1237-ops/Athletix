import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AdminLayout } from "./Dashboard";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const ORANGE = "#ff6600";

const ACTION_COLORS = {
  COMMANDE_PASSEE:         "#27ae60",
  PRODUIT_CREE:            "#3498db",
  PRODUIT_MAJ:             "#2980b9",
  PRODUIT_SUPPRIME:        "#e74c3c",
  UTILISATEUR_CREE:        "#9b59b6",
  UTILISATEUR_MAJ:         "#8e44ad",
  UTILISATEUR_SUPPRIME:    "#c0392b",
  CATEGORIE_CREE:          "#f39c12",
  CATEGORIE_SUPPRIMEE:     "#d35400",
  COMMANDE_STATUT_MAJ:     "#16a085",
};

function ActionBadge({ action }) {
  const color = ACTION_COLORS[action] || "#555";
  return (
    <span style={{
      background: color + "22", border: `1px solid ${color}`,
      color, padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap",
    }}>
      {action}
    </span>
  );
}

export default function GestionLogs() {
  const { accessToken } = useAuth();
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLogs = async (p = 1, action = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 30, ...(action ? { action } : {}) });
      const res  = await fetch(`${API}/admin/logs?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (accessToken) fetchLogs(1, ""); }, [accessToken]);

  const handleSearch = (e) => { e.preventDefault(); fetchLogs(1, search); };

  const handleClear = async () => {
    if (!window.confirm("Supprimer TOUS les logs ? Action irréversible.")) return;
    setClearing(true);
    try {
      await fetch(`${API}/admin/logs`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      showToast("Logs supprimés.");
      fetchLogs(1, "");
      setSearch("");
    } catch {
      showToast("Erreur lors de la suppression.", "error");
    } finally {
      setClearing(false);
    }
  };

  return (
    <AdminLayout current="/admin/logs">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          padding: "14px 22px", borderRadius: "10px",
          background: toast.type === "error" ? "#e74c3c" : "#27ae60",
          color: "#fff", fontWeight: "700", fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={s.topBar}>
        <div>
          <h1 style={s.title}>Logs d'activité</h1>
          <p style={s.sub}>{total} entrée{total > 1 ? "s" : ""} enregistrée{total > 1 ? "s" : ""}</p>
        </div>
        <button style={s.clearBtn} onClick={handleClear} disabled={clearing}>
          {clearing ? "Suppression..." : "🗑 Vider les logs"}
        </button>
      </div>

      {/* Filtre */}
      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          style={s.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrer par action (ex: PRODUIT, COMMANDE, UTILISATEUR...)"
        />
        <button style={s.searchBtn} type="submit">Filtrer</button>
        {search && (
          <button style={s.resetBtn} type="button"
            onClick={() => { setSearch(""); fetchLogs(1, ""); }}>
            ✕ Réinitialiser
          </button>
        )}
      </form>

      {/* Tableau */}
      {loading ? (
        <div style={s.loader}>Chargement des logs...</div>
      ) : logs.length === 0 ? (
        <div style={s.empty}>Aucun log trouvé{search ? ` pour "${search}"` : ""}.</div>
      ) : (
        <div style={s.table}>
          <div style={s.thead}>
            <span style={{ flex: 1.8 }}>Date & Heure</span>
            <span style={{ flex: 2   }}>Action</span>
            <span style={{ flex: 0.8 }}>User ID</span>
            <span style={{ flex: 3   }}>Détails</span>
            <span style={{ flex: 0.4 }}></span>
          </div>

          {logs.map(log => (
            <div key={log._id}>
              <div
                style={{ ...s.trow, ...(expanded === log._id ? s.trowExpanded : {}) }}
                onClick={() => setExpanded(expanded === log._id ? null : log._id)}
              >
                <span style={{ flex: 1.8, color: "#888", fontSize: "13px" }}>
                  {new Date(log.date).toLocaleString("fr-FR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                  })}
                </span>
                <span style={{ flex: 2 }}><ActionBadge action={log.action} /></span>
                <span style={{ flex: 0.8, color: "#aaa", fontSize: "13px" }}>
                  #{log.utilisateur_id}
                </span>
                <span style={{
                  flex: 3, color: "#555", fontSize: "12px",
                  fontFamily: "monospace", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {JSON.stringify(log.details)}
                </span>
                <span style={{ flex: 0.4, color: "#555", textAlign: "right" }}>
                  {expanded === log._id ? "▲" : "▼"}
                </span>
              </div>

              {expanded === log._id && (
                <div style={s.detailBox}>
                  <p style={s.detailLabel}>Détails complets</p>
                  <pre style={s.pre}>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} disabled={page <= 1}
            onClick={() => fetchLogs(page - 1, search)}>
            ← Précédent
          </button>
          <span style={{ color: "#888", fontSize: "14px" }}>
            Page {page} / {pages}
          </span>
          <button style={s.pageBtn} disabled={page >= pages}
            onClick={() => fetchLogs(page + 1, search)}>
            Suivant →
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

const s = {
  topBar:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  title:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "2px", margin: 0 },
  sub:         { color: "#888", fontSize: "14px", margin: "4px 0 0" },
  clearBtn:    { padding: "10px 20px", background: "rgba(231,76,60,0.1)", border: "1px solid #e74c3c", borderRadius: "10px", color: "#e74c3c", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  searchRow:   { display: "flex", gap: "10px", marginBottom: "24px" },
  searchInput: { flex: 1, padding: "12px 16px", background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none" },
  searchBtn:   { padding: "12px 20px", background: ORANGE, border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" },
  resetBtn:    { padding: "12px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888", cursor: "pointer" },
  loader:      { textAlign: "center", padding: "60px", color: "#888" },
  empty:       { textAlign: "center", padding: "60px", color: "#555", background: "#1c1c1e", borderRadius: "12px" },
  table:       { background: "#1c1c1e", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" },
  thead:       { display: "flex", padding: "14px 20px", background: "#222", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase", gap: "16px" },
  trow:        { display: "flex", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: "16px", alignItems: "center", cursor: "pointer", transition: "background 0.15s" },
  trowExpanded:{ background: "rgba(255,102,0,0.05)" },
  detailBox:   { padding: "0 20px 16px 20px", background: "rgba(255,102,0,0.03)", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  detailLabel: { fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700", margin: "0 0 8px" },
  pre:         { background: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px", fontSize: "12px", color: "#9b9b9b", fontFamily: "monospace", overflow: "auto", margin: 0 },
  pagination:  { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "28px" },
  pageBtn:     { padding: "10px 20px", background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "14px" },
};
