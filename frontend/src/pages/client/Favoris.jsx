import { Link, useNavigate } from "react-router-dom";
import { useFavoris } from "../../context/FavorisContext";
import { useCart } from "../../context/CartContext";

const ORANGE = "#ff6600";

export default function Favoris() {
  const { items, loading, removeFavori } = useFavoris();
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <div style={s.loader}>Chargement de vos favoris...</div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes Favoris ♥</h1>

      {items.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyIcon}>🤍</p>
          <h2 style={s.emptyTitle}>Aucun favori pour l'instant</h2>
          <p style={s.emptySub}>Ajoutez des produits à vos favoris depuis le catalogue.</p>
          <button style={s.ctaBtn} onClick={() => navigate("/catalogue")}>
            Explorer le catalogue
          </button>
        </div>
      ) : (
        <div style={s.grid}>
          {items.map((p) => (
            <div key={p.id_produit} style={s.card}>
              <button style={s.heartBtn} onClick={() => removeFavori(p.id_produit)} title="Retirer des favoris">
                ♥
              </button>
              <Link to={`/produit/${p.id_produit}`}>
                <img
                  src={p.img1 || "https://via.placeholder.com/300x200?text=Athletix"}
                  alt={p.nom}
                  style={s.img}
                />
              </Link>
              <div style={s.info}>
                <h3 style={s.nom}>{p.nom}</h3>
                <p style={s.prix}>{Number(p.prix).toFixed(2)} €</p>
                <div style={s.actions}>
                  <button
                    style={s.addBtn}
                    onClick={() => addItem({ id_produit: p.id_produit }, 1)}
                  >
                    + Panier
                  </button>
                  <Link to={`/produit/${p.id_produit}`} style={s.voirBtn}>
                    Voir →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    background: "#111", minHeight: "100vh", padding: "100px 5% 80px",
    fontFamily: "'DM Sans', sans-serif", color: "#f0f0f0",
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px",
    letterSpacing: "2px", marginBottom: "40px",
  },
  loader: {
    background: "#111", minHeight: "100vh", color: "#aaa",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
  },
  empty: { textAlign: "center", paddingTop: "80px" },
  emptyIcon: { fontSize: "64px", marginBottom: "12px" },
  emptyTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px",
    color: "#fff", marginBottom: "12px",
  },
  emptySub: { color: "#888", marginBottom: "32px" },
  ctaBtn: {
    padding: "14px 40px", background: ORANGE, border: "none",
    borderRadius: "30px", color: "#fff", fontSize: "16px",
    fontWeight: "700", cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "28px",
  },
  card: {
    background: "#1a1a1a", borderRadius: "16px", overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)", position: "relative",
  },
  heartBtn: {
    position: "absolute", top: "12px", right: "12px",
    background: "rgba(255,102,0,0.85)", border: "none",
    borderRadius: "50%", width: "34px", height: "34px",
    color: "#fff", fontSize: "16px", cursor: "pointer",
    zIndex: 2,
  },
  img: { width: "100%", height: "220px", objectFit: "cover", display: "block" },
  info: { padding: "18px" },
  nom: { color: "#f0f0f0", fontSize: "16px", fontWeight: "700", marginBottom: "8px" },
  prix: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px",
    color: ORANGE, marginBottom: "14px",
  },
  actions: { display: "flex", gap: "10px" },
  addBtn: {
    flex: 1, padding: "9px 0", background: "rgba(255,102,0,0.1)",
    border: `1.5px solid ${ORANGE}`, borderRadius: "30px",
    color: ORANGE, fontWeight: "700", cursor: "pointer", fontSize: "14px",
  },
  voirBtn: {
    flex: 1, padding: "9px 0", background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: "30px",
    color: "#aaa", fontSize: "14px", textAlign: "center",
    textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
  },
};
