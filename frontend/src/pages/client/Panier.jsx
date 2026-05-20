import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Panier() {
  const { items, totalItems, totalPrice, removeItem, addItem } = useCart();
  const navigate = useNavigate();

  // Gestion de la quantité (le bouton - fonctionne maintenant)
  const changeQuantity = async (id_produit, delta) => {
    await addItem({ id_produit }, delta);
  };

  if (items.length === 0) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <p style={s.emptyIcon}>🛒</p>
          <h2 style={s.emptyTitle}>Votre panier est vide</h2>
          <button style={s.ctaBtn} onClick={() => navigate("/catalogue")}>
            Voir le catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mon panier ({totalItems} article{totalItems > 1 ? "s" : ""})</h1>

      <div style={s.layout}>
        {/* Liste des articles */}
        <div style={s.liste}>
          {items.map((item) => (
            <div key={item.id_produit} style={s.card}>
              <img 
                src={item.img1 || "https://via.placeholder.com/100"} 
                alt={item.nom} 
                style={s.img} 
              />
              
              <div style={s.cardInfo}>
                <h3 style={s.cardNom}>{item.nom}</h3>
                <p style={s.cardPrix}>{Number(item.prix).toFixed(2)} €</p>
                
                <div style={s.qtyRow}>
                  <button 
                    style={s.qtyBtn} 
                    onClick={() => changeQuantity(item.id_produit, -1)}
                  >
                    −
                  </button>
                  <span style={s.qtyVal}>{item.quantite}</span>
                  <button 
                    style={s.qtyBtn} 
                    onClick={() => changeQuantity(item.id_produit, 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={s.cardRight}>
                <p style={s.sousTotal}>{(item.prix * item.quantite).toFixed(2)} €</p>
                <button style={s.removeBtn} onClick={() => removeItem(item.id_produit)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div style={s.recap}>
          <h2 style={s.recapTitle}>Récapitulatif</h2>
          <div style={s.recapLine}>
            <span>Sous-total HT</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
          <div style={s.recapLine}>
            <span>Livraison</span>
            <span style={{ color: "#27ae60" }}>Gratuite</span>
          </div>
          <div style={{ ...s.recapLine, ...s.recapTotal }}>
            <span>Total HT</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
          
          <button style={s.commanderBtn} onClick={() => navigate("/commande")}>
            Passer la commande →
          </button>
          <button style={s.continuerBtn} onClick={() => navigate("/catalogue")}>
            Continuer les achats
          </button>
        </div>
      </div>
    </div>
  );
}

const ORANGE = "#ff6600";

const s = {
  page: { background: "#111", minHeight: "100vh", padding: "100px 5% 60px", fontFamily: "'DM Sans', sans-serif", color: "#f0f0f0" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "2px", marginBottom: "40px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px", alignItems: "start" },
  liste: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "#1a1a1a", borderRadius: "14px", padding: "20px", display: "flex", gap: "20px", alignItems: "center", border: "1px solid rgba(255,255,255,0.06)" },
  img: { width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 },
  cardInfo: { flex: 1 },
  cardNom: { fontSize: "16px", fontWeight: "700", margin: "0 0 6px" },
  cardPrix: { color: "#888", fontSize: "14px", margin: "0 0 12px" },
  
  qtyRow: { display: "flex", alignItems: "center", gap: "12px" },
  qtyBtn: { 
    width: "32px", 
    height: "32px", 
    borderRadius: "50%", 
    border: "1px solid rgba(255,255,255,0.2)", 
    background: "transparent", 
    color: "#fff", 
    fontSize: "20px", 
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  qtyVal: { 
    fontSize: "17px", 
    fontWeight: "700", 
    minWidth: "24px", 
    textAlign: "center" 
  },

  cardRight: { textAlign: "right" },
  sousTotal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: ORANGE, margin: "0 0 12px" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#e74c3c" },

  recap: { background: "#1a1a1a", borderRadius: "16px", padding: "28px", border: "1px solid rgba(255,255,255,0.06)" },
  recapTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "1px", marginBottom: "24px" },
  recapLine: { display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: "14px", marginBottom: "14px" },
  recapTotal: { color: "#fff", fontWeight: "700", fontSize: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginTop: "8px" },
  
  commanderBtn: { width: "100%", padding: "14px", background: ORANGE, border: "none", borderRadius: "30px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "20px" },
  continuerBtn: { width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "30px", color: "#aaa", fontSize: "14px", cursor: "pointer", marginTop: "10px" },
  
  empty: { textAlign: "center", paddingTop: "120px" },
  emptyIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "2px", color: "#fff", marginBottom: "32px" },
  ctaBtn: { padding: "14px 40px", background: ORANGE, border: "none", borderRadius: "30px", color: "#fff", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
};