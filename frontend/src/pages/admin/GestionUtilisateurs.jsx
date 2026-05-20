import { useState, useEffect } from "react";
import { AdminLayout } from "./Dashboard";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";
import { sanitizeObject } from "../../hooks/useSanitize";

const INIT_FORM = { nom: "", prenom: "", email: "", password: "", role: "client" };

export default function GestionUtilisateurs() {
  const { accessToken, user: me } = useAuth();
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [modal, setModal]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]     = useState(INIT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const data = await adminService.getUtilisateurs(accessToken);
      setUsers(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (accessToken) load(); }, [accessToken]);

  const openCreate = () => { setForm(INIT_FORM); setModal("create"); };
  const openEdit   = (u) => {
    setSelected(u);
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, password: "", role: u.role });
    setModal("edit");
  };
  const openDelete = (u) => { setSelected(u); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") {
        await adminService.createUtilisateur(accessToken, sanitizeObject(form));
        showToast("Utilisateur créé !");
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await adminService.updateUtilisateur(accessToken, selected.id_utilisateur, sanitizeObject(payload));
        showToast("Utilisateur mis à jour !");
      }
      closeModal();
      await load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await adminService.deleteUtilisateur(accessToken, selected.id_utilisateur);
      showToast("Utilisateur supprimé !");
      closeModal();
      await load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const filtered = users.filter(u =>
    `${u.prenom} ${u.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout current="/admin/utilisateurs">
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#ef4444" : "#10b981" }}>
          {toast.msg}
        </div>
      )}

      <div style={s.header}>
        <h1 style={s.pageTitle}>Gestion des Utilisateurs</h1>
        <button style={s.btn} onClick={openCreate}>+ Nouvel Utilisateur</button>
      </div>

      <div style={s.toolbar}>
        <input type="text" placeholder="Rechercher par nom ou email..." style={s.searchInput}
          value={search} onChange={e => setSearch(e.target.value)} />
        <span style={s.count}>{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}</span>
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
                <th style={s.th}>Nom</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Rôle</th>
                <th style={s.th}>Inscription</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#666" }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id_utilisateur} style={s.row}>
                  <td style={s.td}>#{u.id_utilisateur}</td>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ ...s.avatar, background: u.role === "admin" ? "rgba(255,102,0,0.2)" : "rgba(59,130,246,0.2)", color: u.role === "admin" ? "#ff6600" : "#3b82f6" }}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <span>{u.prenom} {u.nom}</span>
                      {u.id_utilisateur === me?.id_utilisateur && <span style={{ fontSize: "11px", color: "#666" }}>(vous)</span>}
                    </div>
                  </td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                      background: u.role === "admin" ? "rgba(255,102,0,0.2)" : "rgba(59,130,246,0.2)",
                      color: u.role === "admin" ? "#ff6600" : "#3b82f6" }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={s.td}>{u.date_inscription ? new Date(u.date_inscription).toLocaleDateString("fr-FR") : "—"}</td>
                  <td style={s.td}>
                    <button style={{ ...s.actionBtn, background: "#3b82f6" }} onClick={() => openEdit(u)}>Modifier</button>
                    <button style={{ ...s.actionBtn, background: "#ef4444", opacity: u.id_utilisateur === me?.id_utilisateur ? 0.3 : 1 }}
                      onClick={() => u.id_utilisateur !== me?.id_utilisateur && openDelete(u)}
                      disabled={u.id_utilisateur === me?.id_utilisateur}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>{modal === "create" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}</h2>
            <div style={s.grid2}>
              <label style={s.label}>Prénom *
                <input name="prenom" style={s.input} value={form.prenom} onChange={handleField} />
              </label>
              <label style={s.label}>Nom *
                <input name="nom" style={s.input} value={form.nom} onChange={handleField} />
              </label>
              <label style={s.label}>Email *
                <input name="email" type="email" style={s.input} value={form.email} onChange={handleField} />
              </label>
              <label style={s.label}>Rôle
                <select name="role" style={s.input} value={form.role} onChange={handleField}>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <label style={s.label}>
              {modal === "edit" ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
              <input name="password" type="password" style={s.input} value={form.password} onChange={handleField} placeholder={modal === "edit" ? "••••••••" : ""} />
            </label>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={closeModal}>Annuler</button>
              <button style={s.btn} onClick={handleSave} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={{ ...s.modal, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Supprimer l'utilisateur</h2>
            <p style={{ color: "#aaa", marginBottom: "24px" }}>
              Voulez-vous vraiment supprimer <strong style={{ color: "#fff" }}>{selected?.prenom} {selected?.nom}</strong> ? Cette action est irréversible.
            </p>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={closeModal}>Annuler</button>
              <button style={{ ...s.btn, background: "#ef4444" }} onClick={handleDelete} disabled={saving}>{saving ? "Suppression…" : "Supprimer"}</button>
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
  avatar: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 },
  actionBtn: { padding: "6px 12px", marginRight: "6px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", color: "#fff", fontFamily: FB },
  errorBanner: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  modal: { background: "#1a1a1a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "560px", border: "1px solid rgba(255,255,255,0.1)", fontFamily: FB, maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontFamily: FF, fontSize: "24px", letterSpacing: "1px", color: "#fff", margin: "0 0 24px" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#888", marginBottom: "16px", fontFamily: FB },
  input: { background: "#111", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "14px", fontFamily: FB, outline: "none" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  toast: { position: "fixed", bottom: "24px", right: "24px", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", zIndex: 2000, fontSize: "14px", fontFamily: FB },
};
