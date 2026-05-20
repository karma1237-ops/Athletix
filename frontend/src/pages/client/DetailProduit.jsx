import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useFavoris } from "../../context/FavorisContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const ORANGE = "#ff6600";

export default function DetailProduit() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addItem }  = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavori, addFavori, removeFavori } = useFavoris();

  const [produit, setProduit]   = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [imgActive, setImgActive] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [added, setAdded]       = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/products/${id}`);
        const data = await res.json();
        setProduit(data.produit);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate("/connexion"); return; }
    await addItem(produit, quantite);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleFavori = async () => {
    if (!isAuthenticated) { navigate("/connexion"); return; }
    setFavLoading(true);
    try {
      if (isFavori(produit.id_produit)) {
        await removeFavori(produit.id_produit);
      } else {
        await addFavori(produit.id_produit);
      }
    } finally { setFavLoading(false); }
  };

  if (loading) return <div style={s.loader}>Chargement...</div>;
  if (!produit) return <div style={s.loader}>Produit introuvable.</div>;

  const images    = [produit.img1, produit.img2, produit.img3].filter(Boolean);
  const favActive = isAuthenticated && isFavori(produit.id_produit);

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate(-1)}>← Retour</button>
      <div style={s.wrapper}>
        {/* Galerie */}
        <div style={s.galerie}>
          <img src={images[imgActive] || "https://via.placeholder.com/500"} alt={produit.nom} style={s.imgMain} />
          {images.length > 1 && (
            <div style={s.thumbs}>
              {images.map((img, i) => (
                <img key={i} src={img} alt="" style={{ ...s.thumb, ...(imgActive === i ? s.thumbActive : {}) }} onClick={() => setImgActive(i)} />
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={s.infos}>
          <p style={s.cat}>{produit.categorie?.nom_categorie}</p>
          <h1 style={s.nom}>{produit.nom}</h1>
          <p style={s.prix}>{Number(produit.prix).toFixed(2)} €</p>
          {produit.promotions === 1 && <span style={s.badge}>En promotion</span>}
          <p style={s.desc}>{produit.description || "Aucune description disponible."}</p>
          <p style={s.stock}>
            {produit.stock > 0 ? `✅ En stock (${produit.stock} disponibles)` : "❌ Rupture de stock"}
          </p>

          <div style={s.qtyRow}>
            <button style={s.qtyBtn} onClick={() => setQuantite(Math.max(1, quantite - 1))}>−</button>
            <span style={s.qtyVal}>{quantite}</span>
            <button style={s.qtyBtn} onClick={() => setQuantite(Math.min(produit.stock, quantite + 1))}>+</button>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ ...s.addBtn, ...(added ? s.addBtnSuccess : {}), flex: 1 }}
              onClick={handleAddToCart} disabled={produit.stock === 0}>
              {added ? "✅ Ajouté au panier !" : "Ajouter au panier"}
            </button>
            <button
              style={{ ...s.favBtn, ...(favActive ? s.favBtnActive : {}) }}
              onClick={handleFavori}
              disabled={favLoading}
              title={favActive ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {favActive ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: "#111", minHeight: "100vh", padding: "100px 5% 60px", fontFamily: "'DM Sans', sans-serif" },
  loader: { color: "#fff", textAlign: "center", padding: "100px", background: "#111", minHeight: "100vh" },
  back: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "14px", marginBottom: "32px", padding: 0 },
  wrapper: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" },
  galerie: {},
  imgMain: { width: "100%", borderRadius: "16px", objectFit: "cover", maxHeight: "460px" },
  thumbs: { display: "flex", gap: "10px", marginTop: "12px" },
  thumb: { width: "72px", height: "72px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", border: "2px solid transparent", opacity: 0.6 },
  thumbActive: { border: `2px solid ${ORANGE}`, opacity: 1 },
  infos: { color: "#f0f0f0" },
  cat: { fontSize: "12px", color: ORANGE, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "600", margin: "0 0 10px" },
  nom: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", letterSpacing: "2px", margin: "0 0 16px", lineHeight: 1 },
  prix: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: ORANGE, margin: "0 0 12px" },
  badge: { display: "inline-block", background: "rgba(255,102,0,0.15)", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", marginBottom: "16px" },
  desc: { color: "#aaa", lineHeight: 1.7, margin: "16px 0", fontSize: "15px" },
  stock: { fontSize: "14px", color: "#888", marginBottom: "24px" },
  qtyRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" },
  qtyBtn: { width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: "20px", cursor: "pointer" },
  qtyVal: { fontSize: "20px", fontWeight: "700", minWidth: "24px", textAlign: "center" },
  addBtn: { padding: "16px", background: ORANGE, border: "none", borderRadius: "30px", color: "#fff", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "background 0.3s" },
  addBtnSuccess: { background: "#27ae60" },
  favBtn: { width: "54px", height: "54px", borderRadius: "50%", border: `1.5px solid rgba(255,255,255,0.2)`, background: "transparent", color: "#888", fontSize: "22px", cursor: "pointer", flexShrink: 0 },
  favBtnActive: { border: `1.5px solid ${ORANGE}`, color: ORANGE, background: "rgba(255,102,0,0.1)" },
};
