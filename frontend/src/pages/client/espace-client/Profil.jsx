import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Profil() {
  const { user, accessToken } = useAuth();
  const [form, setForm] = useState({ nom: user?.nom || "", prenom: user?.prenom || "", email: user?.email || "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("✅ Profil mis à jour avec succès !");
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mon profil</h1>
      <div style={s.card}>
        <div style={s.avatar}>{user?.prenom?.[0]}{user?.nom?.[0]}</div>
        <p style={s.role}>{user?.role === "admin" ? "👑 Administrateur" : "🏋️ Client"}</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { label: "Nom", name: "nom" },
            { label: "Prénom", name: "prenom" },
            { label: "Email", name: "email", type: "email" },
          ].map((f) => (
            <div key={f.name} style={s.field}>
              <label style={s.label}>{f.label}</label>
              <input
                type={f.type || "text"}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                style={s.input}
              />
            </div>
          ))}
          {error && <p style={s.error}>{error}</p>}
          {success && <p style={s.successMsg}>{success}</p>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}

const ORANGE = "#ff6600";
const s = {
  page: { background: "#111", minHeight: "100vh", padding: "100px 5% 60px", fontFamily: "'DM Sans', sans-serif", color: "#f0f0f0" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "2px", marginBottom: "40px" },
  card: { background: "#1a1a1a", borderRadius: "20px", padding: "40px", maxWidth: "520px", border: "1px solid rgba(255,255,255,0.06)" },
  avatar: { width: "72px", height: "72px", borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "12px" },
  role: { color: "#888", fontSize: "14px", marginBottom: "32px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", color: "#aaa", fontWeight: "600" },
  input: { padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#f0f0f0", fontSize: "15px", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  error: { color: "#e74c3c", fontSize: "13px" },
  successMsg: { color: "#27ae60", fontSize: "13px" },
  btn: { padding: "13px", background: ORANGE, border: "none", borderRadius: "30px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "8px" },
};
