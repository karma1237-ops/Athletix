import { Link, useNavigate } from "react-router-dom";
import { sanitize } from "../../hooks/useSanitize";
import { useState, useRef, useEffect } from "react";

// ─── Règles de validation (conformes au MCD Athletix) ────────────────────────
const VALIDATORS = {
  nom: (v) => {
    if (!v.trim()) return "Le nom est requis.";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/.test(v))
      return "Le nom ne doit contenir que des lettres.";
    if (v.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
    return "";
  },
  prenom: (v) => {
    if (!v.trim()) return "Le prénom est requis.";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/.test(v))
      return "Le prénom ne doit contenir que des lettres.";
    if (v.trim().length < 2) return "Le prénom doit contenir au moins 2 caractères.";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "L'adresse email est requise.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Format d'email invalide.";
    return "";
  },
  password: (v) => {
    if (!v) return "Le mot de passe est requis.";
    if (v.length < 12) return "Minimum 12 caractères requis.";
    if (!/[A-Z]/.test(v)) return "Au moins 1 lettre majuscule requise.";
    if (!/[0-9]/.test(v)) return "Au moins 1 chiffre requis.";
    return "";
  },
  confirmPassword: (v, pwd) => {
    if (!v) return "Veuillez confirmer le mot de passe.";
    if (v !== pwd) return "Les mots de passe ne correspondent pas.";
    return "";
  },
};

// ─── Force du mot de passe ────────────────────────────────────────────────────
function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Faible", color: "#e74c3c", width: "25%" };
  if (score <= 3) return { label: "Moyen", color: "#f39c12", width: "55%" };
  return { label: "Fort", color: "#27ae60", width: "100%" };
}

export default function Inscription() {
  const navigate = useNavigate();
  const nomRef = useRef(null);

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    nom: "", prenom: "", email: "", password: "", confirmPassword: "",
  });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    nomRef.current?.focus();
    setTimeout(() => setVisible(true), 60);
  }, []);

  const strength = passwordStrength(form.password);

  // ── Mise à jour champ + validation live ──────────────────────────────────
  const handleChange = (field) => (e) => {
    const NON_SANITIZED = ["password", "confirmPassword"];
    const val = NON_SANITIZED.includes(field) ? e.target.value : sanitize(e.target.value);
    setForm((p) => ({ ...p, [field]: val }));
    setGlobalError("");
    if (touched[field]) {
      const err =
        field === "confirmPassword"
          ? VALIDATORS.confirmPassword(val, form.password)
          : VALIDATORS[field](val);
      setErrors((p) => ({ ...p, [field]: err }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((p) => ({ ...p, [field]: true }));
    const err =
      field === "confirmPassword"
        ? VALIDATORS.confirmPassword(form.confirmPassword, form.password)
        : VALIDATORS[field](form[field]);
    setErrors((p) => ({ ...p, [field]: err }));
  };

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tout valider d'un coup
    const newErrors = {
      nom: VALIDATORS.nom(form.nom),
      prenom: VALIDATORS.prenom(form.prenom),
      email: VALIDATORS.email(form.email),
      password: VALIDATORS.password(form.password),
      confirmPassword: VALIDATORS.confirmPassword(form.confirmPassword, form.password),
    };
    setErrors(newErrors);
    setTouched({ nom: true, prenom: true, email: true, password: true, confirmPassword: true });

    if (Object.values(newErrors).some(Boolean)) {
      setGlobalError("Veuillez corriger les erreurs ci-dessous.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.message || "Erreur lors de l'inscription.");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/connexion"), 2200);
      }
    } catch {
      setGlobalError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.bgGlow} />

      {/* Lien retour */}

      <div
        style={{
          ...s.card,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Logo */}
        <div style={s.logoWrap}>
          <span style={s.logo}><span style={s.logoA}>A</span>THLETIX</span>
        </div>
        <h1 style={s.title}>Créer un compte</h1>
        <p style={s.subtitle}>Rejoins la communauté Athletix</p>

        {success ? (
          <div style={s.successBox}>
            <span style={s.successIcon}>✅</span>
            <p style={s.successText}>Inscription réussie ! Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={s.form}>

            {/* Nom + Prénom côte à côte */}
            <div style={s.row}>
              <Field
                label="Nom"
                id="nom"
                ref={nomRef}
                value={form.nom}
                onChange={handleChange("nom")}
                onBlur={handleBlur("nom")}
                error={errors.nom}
                touched={touched.nom}
                placeholder="Dupont"
              />
              <Field
                label="Prénom"
                id="prenom"
                value={form.prenom}
                onChange={handleChange("prenom")}
                onBlur={handleBlur("prenom")}
                error={errors.prenom}
                touched={touched.prenom}
                placeholder="Jean"
              />
            </div>

            {/* Email */}
            <Field
              label="Adresse email"
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              error={errors.email}
              touched={touched.email}
              placeholder="jean.dupont@email.com"
            />

            {/* Mot de passe */}
            <div style={s.fieldWrap}>
              <label style={s.label} htmlFor="password">Mot de passe</label>
              <div style={s.inputWrap}>
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  placeholder="Min. 12 caractères"
                  style={{
                    ...s.input,
                    borderColor: touched.password
                      ? errors.password ? "#e74c3c" : "#27ae60"
                      : "rgba(255,255,255,0.12)",
                    paddingRight: "44px",
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  style={s.eyeBtn}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label="Afficher/masquer"
                >
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Barre de force */}
              {form.password && (
                <div style={s.strengthWrap}>
                  <div style={s.strengthBar}>
                    <div style={{ ...s.strengthFill, width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ ...s.strengthLabel, color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              <ErrorMsg msg={errors.password} show={touched.password} />
            </div>

            {/* Confirmation */}
            <div style={s.fieldWrap}>
              <label style={s.label} htmlFor="confirm">Confirmer le mot de passe</label>
              <div style={s.inputWrap}>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  placeholder="Répétez le mot de passe"
                  style={{
                    ...s.input,
                    borderColor: touched.confirmPassword
                      ? errors.confirmPassword ? "#e74c3c" : "#27ae60"
                      : "rgba(255,255,255,0.12)",
                    paddingRight: "44px",
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  style={s.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label="Afficher/masquer"
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              <ErrorMsg msg={errors.confirmPassword} show={touched.confirmPassword} />
            </div>

            {/* Erreur globale */}
            {globalError && <div style={s.globalError}>⚠️ {globalError}</div>}

            {/* Submit */}
            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Inscription en cours…" : "Créer mon compte"}
            </button>

            <p style={s.loginLink}>
              Déjà un compte ?{" "}
              <Link to="/connexion" style={s.link}>Se connecter</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Composant champ réutilisable ────────────────────────────────────────────
import { forwardRef } from "react";
const Field = forwardRef(function Field(
  { label, id, type = "text", value, onChange, onBlur, error, touched, placeholder },
  ref
) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label} htmlFor={id}>{label}</label>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          ...s.input,
          borderColor: touched
            ? error ? "#e74c3c" : "#27ae60"
            : "rgba(255,255,255,0.12)",
        }}
        autoComplete="off"
      />
      <ErrorMsg msg={error} show={touched} />
    </div>
  );
});

function ErrorMsg({ msg, show }) {
  return (
    <div style={{ minHeight: "18px" }}>
      {show && msg && (
        <p style={s.errorText}>⚠ {msg}</p>
      )}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const FF = "'Bebas Neue', 'Arial Black', sans-serif";
const FB = "'DM Sans', 'Helvetica Neue', sans-serif";
const ORANGE = "#ff6600";

const s = {
  page: {
    fontFamily: FB,
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
    position: "relative",
  },
  bgGlow: {
    position: "fixed",
    top: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,102,0,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "44px 48px",
    width: "100%",
    maxWidth: "540px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: { textAlign: "center", marginBottom: "6px" },
  logo: { fontFamily: FF, fontSize: "22px", letterSpacing: "4px", color: "#fff" },
  logoA: { color: ORANGE },
  title: {
    fontFamily: FF,
    fontSize: "34px",
    letterSpacing: "2px",
    color: "#fff",
    margin: "16px 0 6px",
    textAlign: "center",
  },
  subtitle: { textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "32px" },
  form: { display: "flex", flexDirection: "column", gap: "4px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#aaa", letterSpacing: "0.3px" },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    color: "#f0f0f0",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: FB,
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: 0,
  },
  errorText: {
    fontSize: "12px",
    color: "#e74c3c",
    margin: "0",
    fontWeight: "500",
  },
  strengthWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "6px",
  },
  strengthBar: {
    flex: 1,
    height: "4px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s, background 0.3s",
  },
  strengthLabel: { fontSize: "11px", fontWeight: "700", minWidth: "36px" },
  globalError: {
    background: "rgba(231,76,60,0.1)",
    border: "1px solid rgba(231,76,60,0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#e74c3c",
    fontSize: "13px",
    fontWeight: "500",
  },
  submitBtn: {
    marginTop: "8px",
    padding: "14px",
    background: ORANGE,
    border: "none",
    borderRadius: "30px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.5px",
    transition: "opacity 0.2s, transform 0.2s",
  },
  loginLink: { textAlign: "center", color: "#666", fontSize: "14px", marginTop: "8px" },
  link: { color: ORANGE, textDecoration: "none", fontWeight: "600" },
  successBox: {
    textAlign: "center",
    padding: "40px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  successIcon: { fontSize: "56px" },
  successText: { color: "#27ae60", fontSize: "17px", fontWeight: "600" },
};
