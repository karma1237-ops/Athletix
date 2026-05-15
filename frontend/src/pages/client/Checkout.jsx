import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../services/orderService";
import { sanitizeObject } from "../../hooks/useSanitize";

const ORANGE = "#ff6600";
const GREEN  = "#27ae60";

// ── Formatage numéro carte ───────────────────────────────────────────────────
function formatCard(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExp(v) {
  const n = v.replace(/\D/g, "").slice(0, 4);
  return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n;
}

export default function Checkout() {
  const navigate   = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { accessToken } = useAuth();

  const [step, setStep] = useState(1); // 1=Adresse 2=Paiement 3=Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [commande, setCommande] = useState(null);

  const [adresse, setAdresse] = useState({
    numero: "", rue: "", codepostal: "", ville: "", pays: "France",
  });
  const [paiement, setPaiement] = useState({
    type_paiement: "visa",
    numero_carte: "", expiration: "", cvv: "", nom_carte: "",
  });

  // ── Validation ────────────────────────────────────────────────────────────
  const adresseOk = adresse.rue && adresse.codepostal && adresse.ville;
  const paiementOk =
    paiement.type_paiement === "paypal" ||
    (paiement.numero_carte.replace(/\s/g, "").length === 16 &&
     paiement.expiration.length === 5 &&
     paiement.cvv.length >= 3 &&
     paiement.nom_carte.trim().length >= 2);

  if (items.length === 0 && step < 3) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <p style={{ fontSize: "48px" }}>🛒</p>
          <h2 style={s.emptyTitle}>Votre panier est vide</h2>
          <button style={s.ctaBtn} onClick={() => navigate("/catalogue")}>
            Voir le catalogue
          </button>
        </div>
      </div>
    );
  }

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const rawPayload = {
        ...adresse,
        numero: parseInt(adresse.numero) || 1,
        ...paiement,
        numero_carte: paiement.type_paiement === "visa"
          ? paiement.numero_carte.replace(/\s/g, "")
          : undefined,
      };
      // Sanitize XSS avant envoi (sauf champs sensibles déjà validés)
      const { numero_carte, cvv, expiration, ...safeFields } = rawPayload;
      const payload = {
        ...sanitizeObject(safeFields),
        numero_carte,
        cvv,
        expiration,
      };
      const result = await orderService.checkout(accessToken, payload);
      setCommande(result.commande);
      setStep(3);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // ── ÉTAPE 3 : Confirmation ────────────────────────────────────────────────
  if (step === 3 && commande) {
    return (
      <div style={s.page}>
        <div style={s.confirmBox}>
          <div style={s.checkCircle}>✓</div>
          <h1 style={s.confirmTitle}>Commande confirmée !</h1>
          <p style={s.confirmSub}>
            Votre paiement a été accepté et votre commande est en cours de traitement.
          </p>
          <div style={s.confirmCard}>
            <div style={s.confirmRow}>
              <span style={s.confirmLabel}>N° de commande</span>
              <span style={s.confirmVal}>#{commande.id_commande}</span>
            </div>
            <div style={s.confirmRow}>
              <span style={s.confirmLabel}>Montant total</span>
              <span style={{ ...s.confirmVal, color: ORANGE }}>{Number(commande.montant).toFixed(2)} €</span>
            </div>
            <div style={s.confirmRow}>
              <span style={s.confirmLabel}>Statut</span>
              <span style={{ ...s.confirmVal, color: GREEN }}>En attente de traitement</span>
            </div>
            <div style={s.confirmRow}>
              <span style={s.confirmLabel}>Référence paiement</span>
              <span style={{ ...s.confirmVal, fontSize: "12px", color: "#888" }}>{commande.transaction_id}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button style={s.ctaBtn} onClick={() => navigate("/historique")}>
              Voir mes commandes
            </button>
            <button style={s.outlineBtn} onClick={() => navigate("/catalogue")}>
              Continuer les achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Stepper */}
      <div style={s.stepper}>
        {["Adresse", "Paiement"].map((label, i) => (
          <div key={i} style={s.stepperItem}>
            <div style={{ ...s.stepperDot, ...(step > i + 1 ? s.stepperDone : step === i + 1 ? s.stepperActive : {}) }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span style={{ ...s.stepperLabel, ...(step === i + 1 ? { color: "#fff" } : {}) }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={s.layout}>
        {/* ── ÉTAPE 1 : Adresse ── */}
        {step === 1 && (
          <div style={s.formCard}>
            <h2 style={s.formTitle}>Adresse de livraison</h2>
            <div style={s.fieldRow}>
              <Field label="N°" value={adresse.numero} onChange={v => setAdresse(a => ({ ...a, numero: v }))} placeholder="12" style={{ width: "80px" }} />
              <Field label="Rue" value={adresse.rue} onChange={v => setAdresse(a => ({ ...a, rue: v }))} placeholder="Rue de la Paix" flex />
            </div>
            <div style={s.fieldRow}>
              <Field label="Code postal" value={adresse.codepostal} onChange={v => setAdresse(a => ({ ...a, codepostal: v }))} placeholder="75001" style={{ width: "130px" }} />
              <Field label="Ville" value={adresse.ville} onChange={v => setAdresse(a => ({ ...a, ville: v }))} placeholder="Paris" flex />
            </div>
            <Field label="Pays" value={adresse.pays} onChange={v => setAdresse(a => ({ ...a, pays: v }))} placeholder="France" />
            <button
              style={{ ...s.ctaBtn, marginTop: "28px", opacity: adresseOk ? 1 : 0.5 }}
              disabled={!adresseOk}
              onClick={() => setStep(2)}
            >
              Continuer vers le paiement →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Paiement ── */}
        {step === 2 && (
          <div style={s.formCard}>
            <h2 style={s.formTitle}>Paiement</h2>

            {/* Choix méthode */}
            <div style={s.payMethodRow}>
              {["visa", "paypal"].map(method => (
                <button
                  key={method}
                  style={{
                    ...s.payMethodBtn,
                    ...(paiement.type_paiement === method ? s.payMethodActive : {}),
                  }}
                  onClick={() => setPaiement(p => ({ ...p, type_paiement: method }))}
                >
                  {method === "visa" ? "💳 Carte bancaire" : "🅿️ PayPal"}
                </button>
              ))}
            </div>

            {paiement.type_paiement === "visa" && (
              <>
                <Field
                  label="Nom sur la carte"
                  value={paiement.nom_carte}
                  onChange={v => setPaiement(p => ({ ...p, nom_carte: v }))}
                  placeholder="Jean Dupont"
                />
                <Field
                  label="Numéro de carte"
                  value={paiement.numero_carte}
                  onChange={v => setPaiement(p => ({ ...p, numero_carte: formatCard(v) }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  mono
                />
                <div style={s.fieldRow}>
                  <Field
                    label="Expiration (MM/AA)"
                    value={paiement.expiration}
                    onChange={v => setPaiement(p => ({ ...p, expiration: formatExp(v) }))}
                    placeholder="12/27"
                    maxLength={5}
                    style={{ width: "140px" }}
                    mono
                  />
                  <Field
                    label="CVV"
                    value={paiement.cvv}
                    onChange={v => setPaiement(p => ({ ...p, cvv: v.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="123"
                    maxLength={4}
                    style={{ width: "90px" }}
                    mono
                    type="password"
                  />
                </div>
                <p style={s.secureNote}>🔒 Simulation sécurisée — aucune donnée réelle transmise</p>
              </>
            )}

            {paiement.type_paiement === "paypal" && (
              <div style={s.paypalInfo}>
                <p style={{ color: "#aaa", marginBottom: "8px" }}>
                  Vous serez redirigé vers PayPal pour finaliser votre paiement (simulation).
                </p>
                <p style={s.secureNote}>🔒 Simulation — aucune redirection réelle</p>
              </div>
            )}

            {error && <div style={s.errorBox}>❌ {error}</div>}

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button style={s.outlineBtn} onClick={() => { setError(""); setStep(1); }}>
                ← Retour
              </button>
              <button
                style={{ ...s.ctaBtn, flex: 1, opacity: (paiementOk && !loading) ? 1 : 0.5 }}
                disabled={!paiementOk || loading}
                onClick={handleSubmit}
              >
                {loading ? "Traitement en cours..." : `Payer ${totalPrice.toFixed(2)} €`}
              </button>
            </div>
          </div>
        )}

        {/* ── Récapitulatif commande ── */}
        <div style={s.recap}>
          <h2 style={s.recapTitle}>Récapitulatif</h2>
          <div style={s.recapItems}>
            {items.map(item => (
              <div key={item.id_produit} style={s.recapItem}>
                <img src={item.img1 || "https://via.placeholder.com/50"} alt={item.nom} style={s.recapImg} />
                <div style={{ flex: 1 }}>
                  <p style={s.recapNom}>{item.nom}</p>
                  <p style={s.recapQty}>× {item.quantite}</p>
                </div>
                <span style={s.recapPrix}>{(item.prix * item.quantite).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div style={s.recapLine}>
            <span>Sous-total</span><span>{totalPrice.toFixed(2)} €</span>
          </div>
          <div style={s.recapLine}>
            <span>Livraison</span><span style={{ color: GREEN }}>Gratuite</span>
          </div>
          <div style={{ ...s.recapLine, ...s.recapTotal }}>
            <span>Total HT</span><span style={{ color: ORANGE }}>{totalPrice.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Composant champ générique ────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, maxLength, mono, type = "text", style = {}, flex = false }) {
  return (
    <div style={{ marginBottom: "18px", flex: flex ? 1 : undefined, ...style }}>
      <label style={fs.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ ...fs.input, ...(mono ? { fontFamily: "monospace", letterSpacing: "0.1em" } : {}) }}
      />
    </div>
  );
}

const s = {
  page: {
    background: "#111", minHeight: "100vh", padding: "100px 5% 80px",
    fontFamily: "'DM Sans', sans-serif", color: "#f0f0f0",
  },
  stepper: {
    display: "flex", gap: "48px", marginBottom: "48px", alignItems: "center",
  },
  stepperItem: { display: "flex", alignItems: "center", gap: "12px" },
  stepperDot: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "#2a2a2a", border: "2px solid #444",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700", color: "#666",
  },
  stepperActive: { background: ORANGE, borderColor: ORANGE, color: "#fff" },
  stepperDone: { background: "#27ae60", borderColor: "#27ae60", color: "#fff" },
  stepperLabel: { fontSize: "14px", color: "#666", fontWeight: "600" },
  layout: {
    display: "grid", gridTemplateColumns: "1fr 360px", gap: "40px", alignItems: "start",
  },
  formCard: {
    background: "#1a1a1a", borderRadius: "16px", padding: "36px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  formTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px",
    letterSpacing: "1.5px", marginBottom: "28px",
  },
  fieldRow: { display: "flex", gap: "16px", alignItems: "flex-end" },
  payMethodRow: { display: "flex", gap: "12px", marginBottom: "24px" },
  payMethodBtn: {
    flex: 1, padding: "14px", background: "#252525",
    border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "12px",
    color: "#aaa", fontSize: "15px", cursor: "pointer", fontWeight: "600",
  },
  payMethodActive: { borderColor: ORANGE, color: "#fff", background: "rgba(255,102,0,0.1)" },
  paypalInfo: { background: "#252525", borderRadius: "12px", padding: "20px", marginBottom: "8px" },
  secureNote: { fontSize: "12px", color: "#555", marginTop: "12px" },
  errorBox: {
    background: "rgba(231,76,60,0.1)", border: "1px solid #e74c3c",
    borderRadius: "10px", padding: "14px 18px", color: "#e74c3c",
    marginTop: "16px", fontSize: "14px",
  },
  ctaBtn: {
    padding: "14px 28px", background: ORANGE, border: "none",
    borderRadius: "30px", color: "#fff", fontSize: "15px",
    fontWeight: "700", cursor: "pointer",
  },
  outlineBtn: {
    padding: "14px 24px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "30px",
    color: "#aaa", fontSize: "14px", cursor: "pointer",
  },
  recap: {
    background: "#1a1a1a", borderRadius: "16px", padding: "28px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  recapTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", marginBottom: "20px",
  },
  recapItems: { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" },
  recapItem: { display: "flex", alignItems: "center", gap: "12px" },
  recapImg: { width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 },
  recapNom: { fontSize: "13px", margin: 0, color: "#ddd" },
  recapQty: { fontSize: "12px", color: "#666", margin: "2px 0 0" },
  recapPrix: { fontSize: "14px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" },
  recapLine: {
    display: "flex", justifyContent: "space-between",
    color: "#aaa", fontSize: "14px", marginBottom: "10px",
  },
  recapTotal: {
    color: "#fff", fontWeight: "700", fontSize: "16px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "12px", marginTop: "8px",
  },
  // Confirmation
  confirmBox: {
    maxWidth: "540px", margin: "0 auto", textAlign: "center", paddingTop: "40px",
  },
  checkCircle: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: GREEN, color: "#fff", fontSize: "36px",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
  },
  confirmTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px",
    letterSpacing: "2px", marginBottom: "12px",
  },
  confirmSub: { color: "#aaa", marginBottom: "32px", fontSize: "16px" },
  confirmCard: {
    background: "#1a1a1a", borderRadius: "16px", padding: "28px",
    border: "1px solid rgba(255,255,255,0.06)", textAlign: "left",
  },
  confirmRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  confirmLabel: { color: "#888", fontSize: "14px" },
  confirmVal: { fontSize: "15px", fontWeight: "700" },
  empty: { textAlign: "center", paddingTop: "100px" },
  emptyTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px",
    color: "#fff", marginBottom: "24px",
  },
};

const fs = {
  label: {
    display: "block", fontSize: "12px", color: "#888",
    textTransform: "uppercase", letterSpacing: "0.8px",
    fontWeight: "600", marginBottom: "8px",
  },
  input: {
    width: "100%", padding: "13px 16px", background: "#252525",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    color: "#fff", fontSize: "15px", boxSizing: "border-box",
    outline: "none",
  },
};
