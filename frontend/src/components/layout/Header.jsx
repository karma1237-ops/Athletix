import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavoris } from "../../context/FavorisContext";

const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";
const ORANGE = "#ff6600";

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { total: totalFavoris } = useFavoris();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate("/connexion"); };
  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ ...s.header, ...(scrolled ? s.headerScrolled : {}) }}>
      <Link to="/" style={s.logo}><span style={s.logoA}>A</span>THLETIX</Link>

      <nav style={s.nav}>
        <Link to="/"         style={{ ...s.navLink, ...(isActive("/")         ? s.navLinkActive : {}) }}>Accueil</Link>
        <Link to="/catalogue" style={{ ...s.navLink, ...(isActive("/catalogue") ? s.navLinkActive : {}) }}>Catalogue</Link>
        {isAuthenticated && (
          <>
            <Link to="/profil"     style={{ ...s.navLink, ...(isActive("/profil")     ? s.navLinkActive : {}) }}>Mon profil</Link>
            <Link to="/historique" style={{ ...s.navLink, ...(isActive("/historique") ? s.navLinkActive : {}) }}>Mes commandes</Link>
          </>
        )}
        {isAdmin && (
          <Link to="/admin" style={{ ...s.navLink, color: ORANGE, fontWeight: "700" }}>Admin ⚙️</Link>
        )}
      </nav>

      <div style={s.actions}>
        {isAuthenticated ? (
          <>
            <Link to="/favoris" style={s.iconBtn} title="Mes favoris">
              ♥{totalFavoris > 0 && <span style={s.badge}>{totalFavoris}</span>}
            </Link>
            <Link to="/panier" style={s.iconBtn} title="Mon panier">
              🛒{totalItems > 0 && <span style={s.badge}>{totalItems}</span>}
            </Link>
            <span style={s.userGreet}>{user?.prenom || user?.nom}</span>
            <button onClick={handleLogout} style={s.btnOutline}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/connexion"   style={s.btnOutline}>Connexion</Link>
            <Link to="/inscription" style={s.btnFill}>S'inscrire</Link>
          </>
        )}
        <button style={s.burger} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? "✕" : "☰"}</button>
      </div>

      {menuOpen && (
        <div style={s.mobileMenu}>
          <Link to="/"         style={s.mobileLink}>Accueil</Link>
          <Link to="/catalogue" style={s.mobileLink}>Catalogue</Link>
          {isAuthenticated ? (
            <>
              <Link to="/panier"     style={s.mobileLink}>🛒 Panier ({totalItems})</Link>
              <Link to="/favoris"    style={s.mobileLink}>♥ Favoris ({totalFavoris})</Link>
              <Link to="/profil"     style={s.mobileLink}>Mon profil</Link>
              <Link to="/historique" style={s.mobileLink}>Mes commandes</Link>
              {isAdmin && <Link to="/admin" style={{ ...s.mobileLink, color: ORANGE }}>Admin ⚙️</Link>}
              <button onClick={handleLogout} style={s.mobileLinkBtn}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion"   style={s.mobileLink}>Connexion</Link>
              <Link to="/inscription" style={{ ...s.mobileLink, color: ORANGE }}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const s = {
  header: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 5%", transition: "background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s", fontFamily: FB },
  headerScrolled: { background: "rgba(17,17,17,0.95)", backdropFilter: "blur(14px)", boxShadow: "0 1px 0 rgba(255,102,0,0.15)" },
  logo: { fontFamily: FF, fontSize: "24px", letterSpacing: "4px", color: "#fff", textDecoration: "none", flexShrink: 0 },
  logoA: { color: ORANGE },
  nav: { display: "flex", gap: "28px", alignItems: "center" },
  navLink: { color: "#ccc", textDecoration: "none", fontSize: "15px", fontWeight: "500", transition: "color 0.2s", paddingBottom: "2px", borderBottom: "2px solid transparent" },
  navLinkActive: { color: "#fff", borderBottom: `2px solid ${ORANGE}` },
  actions: { display: "flex", gap: "12px", alignItems: "center" },
  iconBtn: { position: "relative", fontSize: "20px", textDecoration: "none", lineHeight: 1, padding: "4px" },
  badge: { position: "absolute", top: "-4px", right: "-6px", background: ORANGE, color: "#fff", fontSize: "10px", fontWeight: "700", width: "17px", height: "17px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  userGreet: { color: "#aaa", fontSize: "14px", fontWeight: "500", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  btnOutline: { padding: "8px 20px", border: `1.5px solid ${ORANGE}`, borderRadius: "30px", color: ORANGE, textDecoration: "none", fontSize: "14px", fontWeight: "600", background: "transparent", cursor: "pointer", transition: "background 0.2s" },
  btnFill: { padding: "8px 20px", background: ORANGE, border: "none", borderRadius: "30px", color: "#fff", textDecoration: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  burger: { display: "none", background: "transparent", border: "none", color: "#fff", fontSize: "22px", cursor: "pointer", padding: "4px" },
  mobileMenu: { position: "fixed", top: "64px", left: 0, right: 0, background: "rgba(17,17,17,0.98)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,102,0,0.2)", display: "flex", flexDirection: "column", padding: "16px 5%", gap: "0", zIndex: 999 },
  mobileLink: { color: "#ccc", textDecoration: "none", fontSize: "16px", fontWeight: "500", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "block" },
  mobileLinkBtn: { background: "transparent", border: "none", color: "#e55", fontSize: "16px", fontWeight: "500", padding: "14px 0", cursor: "pointer", textAlign: "left", width: "100%" },
};
