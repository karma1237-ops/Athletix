import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Catalogue() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtreCategorie, setFiltreCategorie] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState("pertinence");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/products`);

        if (!res.ok) throw new Error("Erreur serveur");

        const data = await res.json();
        
        setProduits(data.produits || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrage + Tri
  const produitsFiltres = produits
    .filter((p) => {
      const matchCat = filtreCategorie === "tous" || p.id_categorie === Number(filtreCategorie);
      const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase());
      return matchCat && matchRecherche;
    })
    .sort((a, b) => {
      if (tri === "prix_asc") return Number(a.prix) - Number(b.prix);
      if (tri === "prix_desc") return Number(b.prix) - Number(a.prix);
      return 0;
    });

  if (loading) return <div style={s.loader}>Chargement du catalogue...</div>;
  if (error) return <div style={s.error}>{error}</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Notre Catalogue Athletix</h1>

        <div style={s.filtres}>
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={s.searchInput}
          />

          <div style={s.filtersRow}>
            <div style={s.catButtons}>
              <button
                style={{ ...s.catBtn, ...(filtreCategorie === "tous" ? s.catBtnActive : {}) }}
                onClick={() => setFiltreCategorie("tous")}
              >
                Tous
              </button>
              {categories.map((c) => (
                <button
                  key={c.id_categorie}
                  style={{
                    ...s.catBtn,
                    ...(filtreCategorie === String(c.id_categorie) ? s.catBtnActive : {}),
                  }}
                  onClick={() => setFiltreCategorie(String(c.id_categorie))}
                >
                  {c.nom_categorie}
                </button>
              ))}
            </div>

            <select value={tri} onChange={(e) => setTri(e.target.value)} style={s.select}>
              <option value="pertinence">Pertinence</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      <div style={s.grid}>
        {produitsFiltres.length === 0 ? (
          <p style={s.empty}>Aucun produit ne correspond à ta recherche.</p>
        ) : (
          produitsFiltres.map((p) => (
            <div key={p.id_produit} style={s.card}>
              <Link to={`/produit/${p.id_produit}`}>
                <img
                  src={p.img1 || "https://via.placeholder.com/300x200?text=Athletix"}
                  alt={p.nom}
                  style={s.img}
                />
              </Link>

              {p.promotions === 1 && <span style={s.badge}>PROMO</span>}

              <div style={s.info}>
                <p style={s.cat}>{p.categorie?.nom_categorie || "Sport"}</p>
                <h3 style={s.nom}>{p.nom}</h3>
                <div style={s.bottom}>
                  <span style={s.prix}>{Number(p.prix).toFixed(2)} €</span>
                  <button
                    style={s.addBtn}
                    onClick={(e) => { e.preventDefault(); addItem(p, 1); }}
                    disabled={p.stock <= 0}
                  >
                    {p.stock <= 0 ? "Rupture" : "+ Panier"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const ORANGE = "#ff6600";

const s = {
  page: { 
    background: "#111", 
    minHeight: "100vh", 
    padding: "100px 5% 80px", 
    fontFamily: "'DM Sans', sans-serif" 
  },
  header: { marginBottom: "50px" },
  title: { 
    fontFamily: "'Bebas Neue', sans-serif", 
    fontSize: "42px", 
    marginBottom: "30px",
    color: "#fff"
  },
  filtres: { marginBottom: "30px" },
  searchInput: {
    width: "100%",
    padding: "14px 18px",
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "16px",
    marginBottom: "16px"
  },
  filtersRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px"
  },
  catButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },
  catBtn: {
    padding: "9px 22px",
    borderRadius: "30px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#aaa",
    cursor: "pointer"
  },
  catBtnActive: { background: ORANGE, color: "#fff", borderColor: ORANGE },
  select: {
    padding: "10px 16px",
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    color: "#fff"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "28px"
  },
  card: {
    background: "#1a1a1a",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    position: "relative"
  },
  img: { width: "100%", height: "220px", objectFit: "cover" },
  badge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: ORANGE,
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },
  info: { padding: "18px" },
  cat: { fontSize: "12px", color: ORANGE, textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" },
  nom: { color: "#f0f0f0", fontSize: "17px", fontWeight: "700", marginBottom: "16px" },
  bottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  prix: { 
    fontFamily: "'Bebas Neue', sans-serif", 
    fontSize: "26px", 
    color: ORANGE 
  },
  addBtn: {
    padding: "9px 18px",
    background: "rgba(255,102,0,0.1)",
    border: `1.5px solid ${ORANGE}`,
    borderRadius: "30px",
    color: ORANGE,
    fontWeight: "700",
    cursor: "pointer"
  },
  empty: { 
    gridColumn: "1/-1", 
    textAlign: "center", 
    padding: "80px", 
    color: "#666", 
    fontSize: "18px" 
  },
  loader: { 
    textAlign: "center", 
    padding: "120px", 
    color: "#aaa", 
    fontSize: "18px" 
  },
  error: { 
    textAlign: "center", 
    padding: "100px", 
    color: "#e74c3c", 
    fontSize: "18px" 
  },
};