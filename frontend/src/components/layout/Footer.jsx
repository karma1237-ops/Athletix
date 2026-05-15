import { Link } from "react-router-dom";

const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";
const ORANGE = "#ff6600";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        {/* Brand */}
        <div style={s.brand}>
          <span style={s.logo}>
            <span style={s.logoA}>A</span>THLETIX
          </span>
          <p style={s.tagline}>
            L'équipement fitness & musculation pro, livré en 24h.
          </p>
          <p style={s.credit}>© {year} Athletix — Projet de Fin d'Études · CDA</p>
        </div>

        {/* Nav */}
        <div style={s.col}>
          <h4 style={s.colTitle}>Navigation</h4>
          <Link to="/" style={s.link}>Accueil</Link>
          <Link to="/catalogue" style={s.link}>Catalogue</Link>
          <Link to="/panier" style={s.link}>Panier</Link>
          <Link to="/historique" style={s.link}>Mes commandes</Link>
        </div>

        {/* Compte */}
        <div style={s.col}>
          <h4 style={s.colTitle}>Mon compte</h4>
          <Link to="/connexion" style={s.link}>Connexion</Link>
          <Link to="/inscription" style={s.link}>Inscription</Link>
          <Link to="/profil" style={s.link}>Mon profil</Link>
        </div>

        {/* Infos */}
        <div style={s.col}>
          <h4 style={s.colTitle}>Informations</h4>
          <span style={s.infoItem}>📦 Livraison 24h</span>
          <span style={s.infoItem}>🔒 Paiement sécurisé</span>
          <span style={s.infoItem}>↩️ Retours 30 jours</span>
          <span style={s.infoItem}>💬 Support 7j/7</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={s.bottom}>
        <span style={s.bottomText}>
          Fait avec ❤️ par des passionnés de sport
        </span>
        <div style={s.bottomLinks}>
          <span style={s.bottomLink}>Confidentialité</span>
          <span style={s.sep}>·</span>
          <span style={s.bottomLink}>CGV</span>
          <span style={s.sep}>·</span>
          <span style={s.bottomLink}>Mentions légales</span>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: "#0d0d0d",
    borderTop: "1px solid rgba(255,102,0,0.15)",
    fontFamily: FB,
    color: "#888",
    marginTop: "auto",
  },
  inner: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "48px",
    padding: "60px 5% 48px",
    maxWidth: "1400px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  logo: {
    fontFamily: FF,
    fontSize: "28px",
    letterSpacing: "4px",
    color: "#fff",
  },
  logoA: { color: ORANGE },
  tagline: {
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "260px",
  },
  credit: {
    fontSize: "12px",
    color: "#444",
    margin: 0,
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  colTitle: {
    fontFamily: FF,
    fontSize: "16px",
    letterSpacing: "2px",
    color: "#fff",
    margin: "0 0 8px",
  },
  link: {
    color: "#777",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.2s",
    lineHeight: 1.8,
  },
  infoItem: {
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.8,
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 5%",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    maxWidth: "1400px",
    margin: "0 auto",
    boxSizing: "border-box",
    flexWrap: "wrap",
    gap: "12px",
  },
  bottomText: {
    fontSize: "13px",
    color: "#444",
  },
  bottomLinks: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  bottomLink: {
    fontSize: "12px",
    color: "#444",
    cursor: "pointer",
  },
  sep: {
    color: "#333",
    fontSize: "12px",
  },
};
