import { useState, useEffect } from "react";
import { AdminLayout } from "./Dashboard";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";
import { sanitizeObject } from "../../hooks/useSanitize";

const INIT_FORM = { nom: "", description: "", prix: "", stock: "", id_categorie: "", promotions: false, en_vedette: false, img1: "", img2: "", img3: "" };

export default function GestionProduits() {
  const { accessToken } = useAuth();
  const [produits, setProduits]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [modal, setModal]           = useState(null); // null | "create" | "edit" | "delete"
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(INIT_FORM);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        adminService.getProduits(accessToken),
        adminService.getCategories(accessToken),
      ]);
      setProduits(p);
      setCategories(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (accessToken) load(); }, [accessToken]);

  const openCreate = () => { setForm(INIT_FORM); setModal("create"); };
  const openEdit   = (p) => {
    setSelected(p);
    setForm({
      nom: p.nom, description: p.description || "", prix: p.prix,
      stock: p.stock, id_categorie: p.id_categorie,
      promotions: p.promotions || false, en_vedette: p.en_vedette || false,
      img1: p.img1 || "", img2: p.img2 || "", img3: p.img3 || "",
    });
    setModal("edit");
  };
  const openDelete = (p) => { setSelected(p); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") {
        await adminService.createProduit(accessToken, sanitizeObject({ ...form, prix: parseFloat(form.prix), stock: parseInt(form.stock) || 0 }));
        showToast("Produit créé !");
      } else {
        await adminService.updateProduit(accessToken, selected.id_produit, sanitizeObject({ ...form, prix: parseFloat(form.prix), stock: parseInt(form.stock) || 0 }));
        showToast("Produit mis à jour !");
      }
      closeModal();
      await load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await adminService.deleteProduit(accessToken, selected.id_produit);
      showToast("Produit supprimé !");
      closeModal();
      await load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const filtered = produits.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout current="/admin/produits">
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#ef4444" : "#10b981" }}>
          {toast.msg}
        </div>
      )}

      <div style={s.header}>
        <h1 style={s.pageTitle}>Gestion des Produits</h1>
        <button style={s.btn} onClick={openCreate}>+ Nouveau Produit</button>
      </div>

      <div style={s.toolbar}>
        <input type="text" placeholder="Rechercher un produit..." style={s.searchInput}
          value={search} onChange={e => setSearch(e.target.value)} />
        <span style={s.count}>{filtered.length} produit{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {error && <div style={s.errorBanner}>⚠️ {error}</div>}

      <div style={{ marginTop: "24px", ...s.tableContainer }}>
        {loading ? (
          <div style={s.loader}>Chargement…</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Produit</th>
                <th style={s.th}>Catégorie</th>
                <th style={s.th}>Prix</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Promo</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ ...s.td, textAlign: "center", color: "#666" }}>Aucun produit trouvé</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id_produit} style={s.row}>
                  <td style={s.td}><strong>#{p.id_produit}</strong></td>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {p.img1 && <img src={p.img1} alt="" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", background: "#222" }} onError={e => e.target.style.display = "none"} />}
                      <span>{p.nom}</span>
                    </div>
                  </td>
                  <td style={s.td}>{p.categorie?.nom_categorie || "—"}</td>
                  <td style={s.td}>{Number(p.prix).toFixed(2)} €</td>
                  <td style={s.td}>
                    <span style={{ color: p.stock > 5 ? "#10b981" : p.stock > 0 ? "#f59e0b" : "#ef4444", fontWeight: "600" }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={s.td}>
                    {p.promotions && <span style={{ ...s.badge, background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>Promo</span>}
                    {p.en_vedette && <span style={{ ...s.badge, background: "rgba(255,102,0,0.2)", color: "#ff6600", marginLeft: "4px" }}>★</span>}
                  </td>
                  <td style={s.td}>
                    <div style={s.actionGroup}>
                      <button 
                        style={{ ...s.actionBtn, background: "#3b82f6" }} 
                        onClick={() => openEdit(p)}
                      >
                        Modifier
                      </button>
                      <button 
                        style={{ ...s.actionBtn, background: "#ef4444" }} 
                        onClick={() => openDelete(p)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Créer/Éditer */}
      {(modal === "create" || modal === "edit") && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>{modal === "create" ? "Nouveau produit" : "Modifier le produit"}</h2>
            <div style={s.grid2}>
              <label style={s.label}>Nom *
                <input name="nom" style={s.input} value={form.nom} onChange={handleField} placeholder="Nom du produit" />
              </label>
              <label style={s.label}>Catégorie *
                <select name="id_categorie" style={s.input} value={form.id_categorie} onChange={handleField}>
                  <option value="">— Choisir —</option>
                  {categories.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
                </select>
              </label>
              <label style={s.label}>Prix (€) *
                <input name="prix" type="number" min="0" step="0.01" style={s.input} value={form.prix} onChange={handleField} />
              </label>
              <label style={s.label}>Stock
                <input name="stock" type="number" min="0" style={s.input} value={form.stock} onChange={handleField} />
              </label>
            </div>
            <label style={s.label}>Description
              <textarea name="description" style={{ ...s.input, height: "80px", resize: "vertical" }} value={form.description} onChange={handleField} />
            </label>
            <div style={s.grid3}>
              <label style={s.label}>Image 1 (URL)
                <input name="img1" style={s.input} value={form.img1} onChange={handleField} />
              </label>
              <label style={s.label}>Image 2 (URL)
                <input name="img2" style={s.input} value={form.img2} onChange={handleField} />
              </label>
              <label style={s.label}>Image 3 (URL)
                <input name="img3" style={s.input} value={form.img3} onChange={handleField} />
              </label>
            </div>
            <div style={s.checkRow}>
              <label style={s.checkLabel}>
                <input type="checkbox" name="promotions" checked={form.promotions} onChange={handleField} style={{ marginRight: "8px" }} />
                En promotion
              </label>
              <label style={s.checkLabel}>
                <input type="checkbox" name="en_vedette" checked={form.en_vedette} onChange={handleField} style={{ marginRight: "8px" }} />
                En vedette
              </label>
            </div>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={closeModal}>Annuler</button>
              <button style={s.btn} onClick={handleSave} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {modal === "delete" && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={{ ...s.modal, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Supprimer le produit</h2>
            <p style={{ color: "#aaa", marginBottom: "24px" }}>
              Voulez-vous vraiment supprimer <strong style={{ color: "#fff" }}>{selected?.nom}</strong> ? Cette action est irréversible.
            </p>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={closeModal}>Annuler</button>
              <button style={{ ...s.btn, background: "#ef4444" }} onClick={handleDelete} disabled={saving}>
                {saving ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";

const s = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  pageTitle: { fontFamily: FF, fontSize: "32px", letterSpacing: "2px", color: "#fff", margin: 0 },
  toolbar: { display: "flex", alignItems: "center", gap: "16px" },
  searchInput: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#fff", width: "320px", fontSize: "14px", fontFamily: FB },
  count: { color: "#666", fontSize: "14px" },
  btn: { background: "#ff6600", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px", fontFamily: FB },
  btnSecondary: { background: "#222", color: "#aaa", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px", fontFamily: FB },
  tableContainer: { background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" },
  loader: { padding: "40px", textAlign: "center", color: "#666", fontFamily: FB },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "16px 20px", color: "#888", fontSize: "13px", fontWeight: "500", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  td: { padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#ddd", fontSize: "14px" },
  row: {},
  badge: { padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  
  actionBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    color: "#fff",
    fontFamily: FB,
    whiteSpace: "nowrap",
  },

  errorBanner: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  modal: { background: "#1a1a1a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "640px", border: "1px solid rgba(255,255,255,0.1)", fontFamily: FB, maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontFamily: FF, fontSize: "24px", letterSpacing: "1px", color: "#fff", margin: "0 0 24px" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#888", marginBottom: "16px", fontFamily: FB },
  input: { background: "#111", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "14px", fontFamily: FB, outline: "none" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px" },
  checkRow: { display: "flex", gap: "24px", marginBottom: "16px" },
  checkLabel: { display: "flex", alignItems: "center", fontSize: "14px", color: "#aaa", cursor: "pointer" },
  toast: { position: "fixed", bottom: "24px", right: "24px", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", zIndex: 2000, fontSize: "14px", fontFamily: FB },
};