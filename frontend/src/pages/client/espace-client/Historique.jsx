import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { orderService } from "../../../services/orderService";

const ORANGE = "#ff6600";

const STATUT_LABELS = {
  en_attente: { label: "En attente",  color: "#f39c12" },
  validee:    { label: "Validée",     color: "#3498db" },
  expediee:   { label: "Expédiée",    color: "#9b59b6" },
  livree:     { label: "Livrée",      color: "#27ae60" },
};

export default function Historique() {
  const { accessToken } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    orderService.getMyOrders(accessToken)
      .then(data => setCommandes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <div style={s.page}><p style={{ color: "#888", textAlign: "center", paddingTop: "80px" }}>Chargement...</p></div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes Commandes</h1>

      {commandes.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: "48px" }}>📦</p>
          <h2 style={s.emptyTitle}>Aucune commande pour l'instant</h2>
          <p style={{ color: "#888" }}>Vos commandes passées apparaîtront ici.</p>
        </div>
      ) : (
        <div style={s.list}>
          {commandes.map(cmd => {
            const statut = STATUT_LABELS[cmd.statut] || { label: cmd.statut, color: "#888" };
            const isOpen = expanded === cmd.id_commande;
            return (
              <div key={cmd.id_commande} style={s.card}>
                <div style={s.cardHeader} onClick={() => setExpanded(isOpen ? null : cmd.id_commande)}>
                  <div style={s.cmdInfo}>
                    <span style={s.cmdNum}>Commande #{cmd.id_commande}</span>
                    <span style={s.cmdDate}>{new Date(cmd.date_commande).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ ...s.statutBadge, background: statut.color + "22", border: `1px solid ${statut.color}`, color: statut.color }}>
                      {statut.label}
                    </span>
                    <span style={s.montant}>{Number(cmd.montant_hors_taxe_commande).toFixed(2)} €</span>
                    <span style={{ color: "#555", fontSize: "18px" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={s.cardBody}>
                    {cmd.ligne_commandes?.map((ligne, i) => (
                      <div key={i} style={s.ligne}>
                        <img
                          src={ligne.produit?.img1 || "https://via.placeholder.com/50"}
                          alt={ligne.produit?.nom}
                          style={s.ligneImg}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={s.ligneNom}>{ligne.produit?.nom || "Produit"}</p>
                          <p style={s.ligneQty}>Quantité : {ligne.quantite}</p>
                        </div>
                        <span style={s.lignePrix}>{(Number(ligne.prix) * ligne.quantite).toFixed(2)} €</span>
                      </div>
                    ))}
                    {cmd.adresse && (
                      <div style={s.adresseBox}>
                        <p style={s.adresseTitle}>📍 Adresse de livraison</p>
                        <p style={s.adresseText}>
                          {cmd.adresse.numero} {cmd.adresse.rue}, {cmd.adresse.codepostal} {cmd.adresse.ville}, {cmd.adresse.pays}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { background: "#111", minHeight: "100vh", padding: "100px 5% 80px", fontFamily: "'DM Sans', sans-serif", color: "#f0f0f0" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "2px", marginBottom: "40px" },
  empty: { textAlign: "center", paddingTop: "60px" },
  emptyTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", color: "#fff", marginBottom: "12px" },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "#1a1a1a", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", cursor: "pointer" },
  cmdInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  cmdNum: { fontWeight: "700", fontSize: "16px" },
  cmdDate: { fontSize: "13px", color: "#888" },
  statutBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  montant: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: ORANGE },
  cardBody: { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" },
  ligne: { display: "flex", alignItems: "center", gap: "14px" },
  ligneImg: { width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 },
  ligneNom: { fontWeight: "600", margin: 0, fontSize: "14px" },
  ligneQty: { color: "#888", fontSize: "13px", margin: "2px 0 0" },
  lignePrix: { fontWeight: "700", color: ORANGE, whiteSpace: "nowrap" },
  adresseBox: { background: "#252525", borderRadius: "10px", padding: "14px 18px", marginTop: "8px" },
  adresseTitle: { fontWeight: "700", fontSize: "13px", color: "#888", margin: "0 0 6px" },
  adresseText: { color: "#ccc", fontSize: "14px", margin: 0 },
};
