import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";

const NAV_LINKS = [
  { label: "Dashboard",    path: "/admin",              icon: "📊" },
  { label: "Produits",     path: "/admin/produits",     icon: "📦" },
  { label: "Utilisateurs", path: "/admin/utilisateurs", icon: "👥" },
  { label: "Commandes",    path: "/admin/commandes",    icon: "🛒" },
  { label: "Logs",         path: "/admin/logs",         icon: "📋" },
];

export function AdminLayout({ children, current }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const handleLogout = async () => { await logout(); navigate("/connexion"); };
  return (
    <div style={s.shell}>
      <aside style={{ ...s.sidebar, width: open ? "240px" : "64px" }}>
        <div style={s.sidebarTop}>
          {open && <span style={s.logo}><span style={s.logoA}>A</span>THLETIX</span>}
          <button style={s.toggleBtn} onClick={() => setOpen(v => !v)}>{open ? "◀" : "▶"}</button>
        </div>
        <nav style={s.nav}>
          {NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path} style={{
              ...s.navLink,
              background: current === l.path ? "rgba(255,102,0,0.15)" : "transparent",
              borderLeft: current === l.path ? "3px solid #ff6600" : "3px solid transparent",
              color: current === l.path ? "#ff6600" : "#aaa",
            }}>
              <span style={s.navIcon}>{l.icon}</span>
              {open && <span style={s.navLabel}>{l.label}</span>}
            </Link>
          ))}
        </nav>
        <div style={s.sidebarBottom}>
          <Link to="/" style={{ ...s.navLink, borderLeft: "3px solid transparent", color: "#aaa" }}>
            <span style={s.navIcon}>🏠</span>
            {open && <span style={s.navLabel}>Voir le site</span>}
          </Link>
          <button onClick={handleLogout} style={s.logoutBtn}>
            <span style={s.navIcon}>🚪</span>
            {open && <span style={s.navLabel}>Déconnexion</span>}
          </button>
        </div>
      </aside>
      <main style={s.main}>{children}</main>
    </div>
  );
}

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    adminService.getStats(accessToken)
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const STATS = [
    { label: "Utilisateurs", icon: "👥", couleur: "#ff6600", lien: "/admin/utilisateurs", value: stats?.nbUsers },
    { label: "Produits",     icon: "📦", couleur: "#3b82f6", lien: "/admin/produits",     value: stats?.nbProduits },
    { label: "Commandes",    icon: "🛒", couleur: "#10b981", lien: "/admin/commandes",    value: stats?.nbCommandes },
    { label: "Revenus",      icon: "💶", couleur: "#f59e0b", lien: null, value: stats ? `${Number(stats.revenus).toFixed(0)} €` : null },
  ];

  return (
    <AdminLayout current="/admin">
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Dashboard</h1>
          <p style={s.pageSubtitle}>Bienvenue, <strong style={{ color: "#ff6600" }}>{user?.prenom} {user?.nom}</strong></p>
        </div>
        <div style={s.badge}>Admin</div>
      </div>
      {error && <div style={s.errorBanner}>⚠️ {error}</div>}
      <div style={s.statsGrid}>
        {STATS.map((st, i) => (
          <div key={i} style={{ ...s.statCard, cursor: st.lien ? "pointer" : "default" }}
            onClick={() => st.lien && navigate(st.lien)}>
            <div style={{ ...s.statIconBox, background: st.couleur + "22", color: st.couleur }}>{st.icon}</div>
            <div>
              <div style={s.statValeur}>{loading ? "…" : (st.value ?? "—")}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
            {st.lien && <span style={s.arrow}>→</span>}
          </div>
        ))}
      </div>
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Accès rapides</h2>
        <div style={s.quickGrid}>
          {[
            { label: "Gérer les produits",     path: "/admin/produits",     icon: "📦", desc: "Ajouter, modifier ou supprimer des produits" },
            { label: "Gérer les commandes",    path: "/admin/commandes",    icon: "🛒", desc: "Consulter et mettre à jour les commandes" },
            { label: "Gérer les utilisateurs", path: "/admin/utilisateurs", icon: "👥", desc: "Voir et modifier les comptes utilisateurs" },
          ].map((item, i) => (
            <Link key={i} to={item.path} style={s.quickCard}>
              <span style={s.quickIcon}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={s.quickLabel}>{item.label}</div>
                <div style={s.quickDesc}>{item.desc}</div>
              </div>
              <span style={s.arrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";
const s = {
  shell: { display: "flex", minHeight: "100vh", background: "#111", fontFamily: FB, color: "#f0f0f0" },
  sidebar: { background: "#161616", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", transition: "width 0.25s", overflow: "hidden", flexShrink: 0 },
  sidebarTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", minHeight: "64px", gap: "8px" },
  logo: { fontFamily: FF, fontSize: "20px", letterSpacing: "3px", color: "#fff", whiteSpace: "nowrap" },
  logoA: { color: "#ff6600" },
  toggleBtn: { background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", flexShrink: 0 },
  nav: { flex: 1, display: "flex", flexDirection: "column", padding: "12px 0", gap: "2px" },
  navLink: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", textDecoration: "none", transition: "background 0.15s", whiteSpace: "nowrap" },
  navIcon: { fontSize: "18px", flexShrink: 0, width: "24px", textAlign: "center" },
  navLabel: { fontSize: "14px", fontWeight: "500" },
  sidebarBottom: { borderTop: "1px solid rgba(255,255,255,0.07)", padding: "12px 0" },
  logoutBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", color: "#e74c3c", background: "none", border: "none", cursor: "pointer", width: "100%", fontFamily: FB, whiteSpace: "nowrap", fontSize: "14px" },
  main: { flex: 1, padding: "32px", overflowY: "auto" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" },
  pageTitle: { fontFamily: FF, fontSize: "36px", letterSpacing: "2px", color: "#fff", margin: 0 },
  pageSubtitle: { color: "#666", fontSize: "14px", marginTop: "4px" },
  badge: { background: "rgba(255,102,0,0.15)", color: "#ff6600", border: "1px solid rgba(255,102,0,0.3)", borderRadius: "20px", padding: "4px 14px", fontSize: "12px", fontWeight: "700", letterSpacing: "1px" },
  errorBanner: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", position: "relative" },
  statIconBox: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 },
  statValeur: { fontSize: "28px", fontWeight: "700", color: "#fff", fontFamily: FF },
  statLabel: { fontSize: "13px", color: "#666", marginTop: "2px" },
  arrow: { position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: "18px" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontFamily: FF, fontSize: "22px", letterSpacing: "1px", color: "#fff", marginBottom: "16px" },
  quickGrid: { display: "flex", flexDirection: "column", gap: "10px" },
  quickCard: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none", color: "#f0f0f0", position: "relative" },
  quickIcon: { fontSize: "24px", width: "36px", textAlign: "center", flexShrink: 0 },
  quickLabel: { fontSize: "15px", fontWeight: "600", color: "#fff" },
  quickDesc: { fontSize: "13px", color: "#666", marginTop: "2px" },
};
