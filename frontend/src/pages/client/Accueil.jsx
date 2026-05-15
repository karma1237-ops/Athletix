import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Accueil() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [visible, setVisible] = useState(false);

  const { addItem } = useCart();

  // Récupération des produits en vedette
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        
        const vedettes = (data.produits || []).filter(p => p.en_vedette === true || p.en_vedette === 1);
        setFeatured(vedettes.slice(0, 4));
      } catch (err) {
        console.error("Erreur chargement produits vedette :", err);
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  return (
    <div style={s.page}>
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroNoise} />
        <div
          style={{
            ...s.heroContent,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <span style={s.heroBadge}>🔥 Équipements pro, prix imbattables</span>
          <h1 style={s.heroTitle}>
            Forge ton <br />
            <span style={s.heroAccent}>corps</span> ici.
          </h1>
          <p style={s.heroSub}>
            Tout l'équipement fitness & musculation dont tu as besoin,
            livré en 24h directement chez toi.
          </p>
          <div style={s.heroCtas}>
            <a href="#catalogue" style={s.ctaPrimary}>
              Explorer le catalogue
            </a>
            <Link to="/inscription" style={s.ctaSecondary}>
              Créer un compte →
            </Link>
          </div>
        </div>
        <div
          style={{
            ...s.heroImageWrap,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(40px)",
            transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=85"
            alt="Salle de sport"
            style={s.heroImg}
          />
          <div style={s.heroImgGlow} />
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section style={s.statsBar}>
        {STATS.map((st, i) => (
          <div key={i} style={s.statItem}>
            <span style={s.statVal}>{st.valeur}</span>
            <span style={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section id="categories" style={s.section}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>Nos catégories</h2>
          <p style={s.sectionSub}>Trouve l'équipement fait pour toi</p>
        </div>
        <div style={s.catGrid}>
          {CATEGORIES.map((c, i) => (
            <div key={i} style={s.catCard}>
              <span style={s.catIcon}>{c.icon}</span>
              <span style={s.catNom}>{c.nom}</span>
              <span style={s.catCount}>{c.count} articles</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUITS VEDETTE ────────────────────────────────────────────────── */}
      <section id="catalogue" style={{ ...s.section, background: "#0d0d0d" }}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>Produits vedette</h2>
          <p style={s.sectionSub}>Sélection de la semaine</p>
        </div>

        <div style={s.prodGrid}>
          {loading ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666", padding: "60px 0" }}>
              Chargement des meilleurs produits...
            </p>
          ) : featured.length > 0 ? (
            featured.map((p) => (
              <div
                key={p.id_produit}
                style={{
                  ...s.prodCard,
                  transform: hoveredCard === p.id_produit ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: hoveredCard === p.id_produit
                    ? "0 20px 40px rgba(255,102,0,0.25)"
                    : "0 4px 20px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={() => setHoveredCard(p.id_produit)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={s.prodImgWrap}>
                  <img 
                    src={p.img1 || "https://via.placeholder.com/300x200?text=Athletix"} 
                    alt={p.nom} 
                    style={s.prodImg} 
                  />
                  {p.promotions === 1 && <span style={s.prodBadge}>Promo</span>}
                </div>
                <div style={s.prodInfo}>
                  <span style={s.prodCat}>{p.categorie?.nom_categorie || "Sport"}</span>
                  <h3 style={s.prodNom}>{p.nom}</h3>
                  <div style={s.prodBottom}>
                    <span style={s.prodPrix}>{Number(p.prix).toFixed(2)} €</span>
                    <button 
                      style={s.addBtn}
                      onClick={(e) => { e.preventDefault(); addItem(p, 1); }}
                    >
                      + Panier
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666", padding: "60px 0" }}>
              Aucun produit vedette pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section id="about" style={s.ctaBanner}>
        <div style={s.ctaBannerInner}>
          <h2 style={s.ctaBannerTitle}>
            Prêt à transformer ton entraînement ?
          </h2>
          <p style={s.ctaBannerSub}>
            Rejoins 18 000 athlètes qui font confiance à Athletix.
          </p>
          <Link to="/inscription" style={s.ctaBannerBtn}>
            Commencer maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── DONNÉES STATIQUES ─────────────────────────────────────────────────────
const CATEGORIES = [
  { nom: "Musculation", icon: "🏋️", count: 48 },
  { nom: "Cardio", icon: "🏃", count: 32 },
  { nom: "Fitness", icon: "🧘", count: 27 },
  { nom: "Accessoires", icon: "🎽", count: 64 },
];

const STATS = [
  { valeur: "2 400+", label: "Produits disponibles" },
  { valeur: "18 000+", label: "Clients satisfaits" },
  { valeur: "98%", label: "Avis positifs" },
  { valeur: "24h", label: "Expédition express" },
];

// ─── STYLES ────────────────────────────────────────────────────────────────
const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";
const ORANGE = "#ff6600";
const ORANGE2 = "#ff8533";

const s = {
  page: {
    fontFamily: FB,
    background: "#111",
    color: "#f0f0f0",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  // HERO
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    padding: "0 5%",
    gap: "60px",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse 70% 60% at 70% 50%, rgba(255,102,0,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroNoise: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
    backgroundRepeat: "repeat",
    backgroundSize: "128px",
    pointerEvents: "none",
    opacity: 0.5,
  },
  heroContent: { flex: "0 0 50%", zIndex: 1 },
  heroBadge: {
    display: "inline-block",
    background: "rgba(255,102,0,0.15)",
    border: "1px solid rgba(255,102,0,0.35)",
    color: ORANGE2,
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "28px",
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontFamily: FF,
    fontSize: "clamp(64px, 8vw, 110px)",
    lineHeight: 0.95,
    margin: "0 0 28px",
    letterSpacing: "2px",
    color: "#fff",
  },
  heroAccent: { color: ORANGE },
  heroSub: {
    fontSize: "17px",
    color: "#aaa",
    lineHeight: 1.65,
    maxWidth: "420px",
    marginBottom: "40px",
  },
  heroCtas: { display: "flex", gap: "16px", flexWrap: "wrap" },
  ctaPrimary: {
    padding: "15px 34px",
    background: ORANGE,
    borderRadius: "40px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "16px",
    transition: "transform 0.2s",
  },
  ctaSecondary: {
    padding: "15px 28px",
    color: "#ddd",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    borderBottom: `2px solid ${ORANGE}`,
  },
  heroImageWrap: { flex: "0 0 45%", position: "relative", zIndex: 1 },
  heroImg: {
    width: "100%",
    height: "560px",
    objectFit: "cover",
    borderRadius: "24px",
    filter: "brightness(0.85) contrast(1.1)",
  },
  heroImgGlow: {
    position: "absolute",
    bottom: "-30px",
    left: "10%",
    right: "10%",
    height: "80px",
    background: "rgba(255,102,0,0.3)",
    filter: "blur(40px)",
    borderRadius: "50%",
  },

  // STATS
  statsBar: {
    display: "flex",
    justifyContent: "space-around",
    padding: "36px 5%",
    background: "rgba(255,102,0,0.07)",
    borderTop: "1px solid rgba(255,102,0,0.15)",
    borderBottom: "1px solid rgba(255,102,0,0.15)",
    flexWrap: "wrap",
    gap: "24px",
  },
  statItem: { textAlign: "center" },
  statVal: {
    display: "block",
    fontFamily: FF,
    fontSize: "40px",
    color: ORANGE,
    letterSpacing: "2px",
  },
  statLabel: { fontSize: "13px", color: "#888", letterSpacing: "0.5px" },

  // SECTION
  section: { padding: "80px 5%" },
  sectionHead: { textAlign: "center", marginBottom: "48px" },
  sectionTitle: {
    fontFamily: FF,
    fontSize: "48px",
    letterSpacing: "3px",
    margin: 0,
    color: "#fff",
  },
  sectionSub: {
    fontSize: "15px",
    color: "#777",
    marginTop: "10px",
  },

  // CATEGORIES
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },
  catCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  catIcon: { fontSize: "36px" },
  catNom: { fontWeight: "700", fontSize: "16px", color: "#fff" },
  catCount: { fontSize: "13px", color: "#666" },

  // PRODUITS VEDETTE
  prodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  prodCard: {
    background: "#1a1a1a",
    borderRadius: "20px",
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  prodImgWrap: { position: "relative", height: "220px", overflow: "hidden" },
  prodImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  prodBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: ORANGE,
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  prodInfo: { padding: "18px 20px 22px" },
  prodCat: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: ORANGE,
    fontWeight: "600",
  },
  prodNom: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#f0f0f0",
    margin: "6px 0 16px",
  },
  prodBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prodPrix: {
    fontFamily: FF,
    fontSize: "26px",
    color: ORANGE,
    letterSpacing: "1px",
  },
  addBtn: {
    padding: "9px 18px",
    background: "rgba(255,102,0,0.15)",
    border: `1px solid ${ORANGE}`,
    borderRadius: "20px",
    color: ORANGE,
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  // CTA BANNER
  ctaBanner: {
    padding: "90px 5%",
    background: `linear-gradient(135deg, #1a0800 0%, #2a1000 50%, #1a0800 100%)`,
    borderTop: `1px solid rgba(255,102,0,0.2)`,
    borderBottom: `1px solid rgba(255,102,0,0.2)`,
    position: "relative",
    overflow: "hidden",
  },
  ctaBannerInner: { textAlign: "center", position: "relative", zIndex: 1 },
  ctaBannerTitle: {
    fontFamily: FF,
    fontSize: "clamp(36px, 5vw, 60px)",
    letterSpacing: "3px",
    color: "#fff",
    margin: "0 0 16px",
  },
  ctaBannerSub: { fontSize: "16px", color: "#aaa", marginBottom: "36px" },
  ctaBannerBtn: {
    display: "inline-block",
    padding: "16px 48px",
    background: ORANGE,
    borderRadius: "40px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "17px",
    letterSpacing: "0.5px",
  },
};