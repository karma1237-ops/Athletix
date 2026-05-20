import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { sanitize } from "../../hooks/useSanitize";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_ATTEMPTS = 3; // doit correspondre au backend

const VALIDATORS = {
  email:    (v) => !v.trim() ? "L'adresse email est requise."    : !EMAIL_RE.test(v) ? "Format d'email invalide." : "",
  password: (v) => !v        ? "Le mot de passe est requis."     : "",
};

export default function Connexion() {
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const emailRef   = useRef(null);

  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({ email: "", password: "" });
  const [touched, setTouched]     = useState({});
  const [showPwd, setShowPwd]     = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);  // timestamp ms
  const [attemptsLeft, setAttemptsLeft]   = useState(null);  // tentatives restantes

  useEffect(() => {
    emailRef.current?.focus();
    setTimeout(() => setVisible(true), 60);
  }, []);

  // ── Countdown ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!cooldownUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(null);
        setGlobalError("");
        setAttemptsLeft(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const getRemainingTime = () => {
    if (!cooldownUntil) return "";
    const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
    if (remaining <= 0) return "";
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    return min > 0 ? `${min} min ${String(sec).padStart(2, "0")}s` : `${sec}s`;
  };

  const isCooldownActive = !!(cooldownUntil && Date.now() < cooldownUntil);

  // ── Champ ────────────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    const val = field === "password" ? e.target.value : sanitize(e.target.value);
    setForm((p) => ({ ...p, [field]: val }));
    setGlobalError("");
    if (touched[field]) setErrors((p) => ({ ...p, [field]: VALIDATORS[field](val) }));
  };

  const handleBlur = (field) => () => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: VALIDATORS[field](form[field]) }));
  };

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCooldownActive) return;

    const newErrors = {
      email:    VALIDATORS.email(form.email),
      password: VALIDATORS.password(form.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setGlobalError("");
    setAttemptsLeft(null);

    try {
      const user = await login(sanitize(form.email).trim().toLowerCase(), form.password);
      navigate(user?.role === "admin" ? "/admin" : "/catalogue");
    } catch (err) {
      // Cas verrouillage (429) — avec ou sans waitSeconds
      if (err.status === 429 || err.waitSeconds > 0) {
        const until = err.waitSeconds
          ? Date.now() + err.waitSeconds * 1000
          : err.lockedUntil
          ? new Date(err.lockedUntil).getTime()
          : Date.now() + 60000;
        setCooldownUntil(until);
        setGlobalError("Compte temporairement bloqué suite à trop de tentatives.");
        setAttemptsLeft(0);
      } else {
        // Erreur classique 401 — afficher tentatives restantes si disponible
        setGlobalError(err.message || "Email ou mot de passe incorrect.");
        if (err.attemptsLeft !== null && err.attemptsLeft !== undefined) {
          setAttemptsLeft(err.attemptsLeft);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.bgGlow} />
      <div style={s.bgGlow2} />

      <div style={{
        ...s.card,
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition:"opacity 0.6s ease, transform 0.6s ease",
      }}>
        <div style={s.cardInner}>

          {/* Panneau gauche */}
          <div style={s.leftPanel}>
            <div style={s.leftOverlay} />
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
              alt="" style={s.leftImg}
            />
            <div style={s.leftText}>
              <span style={s.leftLogo}><span style={s.logoA}>A</span>THLETIX</span>
              <p style={s.leftQuote}>"La douleur d'aujourd'hui est la force de demain."</p>
            </div>
          </div>

          {/* Formulaire */}
          <div style={s.rightPanel}>
            <h1 style={s.title}>Bon retour 👋</h1>
            <p style={s.subtitle}>Connecte-toi à ton espace Athletix</p>

            <form onSubmit={handleSubmit} noValidate style={s.form}>

              {/* Email */}
              <div style={s.fieldWrap}>
                <label style={s.label} htmlFor="email">Adresse email</label>
                <input
                  ref={emailRef} id="email" type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholder="jean.dupont@email.com"
                  autoComplete="email"
                  disabled={isCooldownActive}
                  style={{ ...s.input,
                    borderColor: touched.email
                      ? errors.email ? "#e74c3c" : "#27ae60"
                      : "rgba(255,255,255,0.12)",
                  }}
                />
                <div style={{ minHeight: "18px" }}>
                  {touched.email && errors.email && <p style={s.errorText}>⚠ {errors.email}</p>}
                </div>
              </div>

              {/* Mot de passe */}
              <div style={s.fieldWrap}>
                <div style={s.labelRow}>
                  <label style={s.label} htmlFor="password">Mot de passe</label>
                  <a href="#" style={s.forgotLink}>Mot de passe oublié ?</a>
                </div>
                <div style={s.inputWrap}>
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    disabled={isCooldownActive}
                    style={{ ...s.input,
                      borderColor: touched.password
                        ? errors.password ? "#e74c3c" : "#27ae60"
                        : "rgba(255,255,255,0.12)",
                      paddingRight: "44px",
                    }}
                  />
                  <button type="button" style={s.eyeBtn}
                    onClick={() => setShowPwd(v => !v)}
                    disabled={isCooldownActive} aria-label="Afficher/masquer">
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
                <div style={{ minHeight: "18px" }}>
                  {touched.password && errors.password && <p style={s.errorText}>⚠ {errors.password}</p>}
                </div>
              </div>

              {/* Erreur globale */}
              {globalError && (
                <div style={{ ...s.globalError, ...(isCooldownActive ? s.globalErrorLocked : {}) }}>
                  <span>{isCooldownActive ? "🔒" : "⚠️"} {globalError}</span>

                  {/* Timer de verrouillage */}
                  {isCooldownActive && (
                    <div style={s.timerBox}>
                      <div style={s.timerLabel}>Temps avant déblocage</div>
                      <div style={s.timerValue}>{getRemainingTime()}</div>
                    </div>
                  )}

                  {/* Tentatives restantes */}
                  {!isCooldownActive && attemptsLeft !== null && attemptsLeft > 0 && (
                    <div style={s.attemptsLeft}>
                      ⚡ {attemptsLeft} tentative{attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""} avant blocage temporaire
                    </div>
                  )}
                </div>
              )}

              {/* Bouton */}
              <button type="submit" style={{
                ...s.submitBtn,
                opacity: loading || isCooldownActive ? 0.65 : 1,
                cursor:  isCooldownActive ? "not-allowed" : "pointer",
                background: isCooldownActive ? "#555" : "#ff6600",
              }} disabled={loading || isCooldownActive}>
                {isCooldownActive
                  ? `🔒 Réessayez dans ${getRemainingTime()}`
                  : loading ? "Connexion en cours..." : "Se connecter"}
              </button>

              <div style={s.separator}>
                <span style={s.sepLine} />
                <span style={s.sepText}>Pas encore de compte ?</span>
                <span style={s.sepLine} />
              </div>

              <Link to="/inscription" style={s.registerBtn}>
                Créer un compte gratuitement
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const FF     = "'Bebas Neue', 'Arial Black', sans-serif";
const FB     = "'DM Sans', 'Helvetica Neue', sans-serif";
const ORANGE = "#ff6600";

const s = {
  page:        { fontFamily: FB, minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden" },
  bgGlow:      { position: "fixed", top: "-15%", left: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,102,0,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  bgGlow2:     { position: "fixed", bottom: "-20%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,102,0,0.06) 0%, transparent 70%)", pointerEvents: "none" },
  card:        { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", width: "100%", maxWidth: "820px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden", position: "relative", zIndex: 1 },
  cardInner:   { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "560px" },
  leftPanel:   { position: "relative", overflow: "hidden", minHeight: "480px" },
  leftImg:     { width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, filter: "brightness(0.55)" },
  leftOverlay: { position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,102,0,0.4) 0%, rgba(0,0,0,0.6) 100%)", zIndex: 1 },
  leftText:    { position: "absolute", bottom: "36px", left: "28px", right: "28px", zIndex: 2 },
  leftLogo:    { fontFamily: FF, fontSize: "24px", letterSpacing: "4px", color: "#fff", display: "block", marginBottom: "12px" },
  logoA:       { color: ORANGE },
  leftQuote:   { fontStyle: "italic", color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.6, margin: 0 },
  rightPanel:  { padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" },
  title:       { fontFamily: FF, fontSize: "34px", letterSpacing: "2px", color: "#fff", margin: "0 0 8px" },
  subtitle:    { color: "#666", fontSize: "14px", marginBottom: "32px" },
  form:        { display: "flex", flexDirection: "column", gap: "4px" },
  fieldWrap:   { display: "flex", flexDirection: "column", gap: "6px" },
  labelRow:    { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label:       { fontSize: "13px", fontWeight: "600", color: "#aaa", letterSpacing: "0.3px" },
  forgotLink:  { fontSize: "12px", color: ORANGE, textDecoration: "none", fontWeight: "500" },
  inputWrap:   { position: "relative" },
  input:       { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box", fontFamily: FB },
  eyeBtn:      { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: 0 },
  errorText:   { fontSize: "12px", color: "#e74c3c", margin: 0, fontWeight: "500" },
  globalError: { background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#e74c3c", fontSize: "13px", fontWeight: "500" },
  globalErrorLocked: { background: "rgba(180,60,20,0.15)", border: "1px solid rgba(255,102,0,0.5)", color: "#ffaa66" },
  timerBox:    { marginTop: "10px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "10px 14px", textAlign: "center" },
  timerLabel:  { fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" },
  timerValue:  { fontSize: "28px", fontFamily: FF, color: ORANGE, letterSpacing: "3px" },
  attemptsLeft:{ marginTop: "8px", fontSize: "12px", color: "#ffaa00", fontWeight: "600" },
  submitBtn:   { marginTop: "4px", padding: "14px", background: ORANGE, border: "none", borderRadius: "30px", color: "#fff", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px", transition: "opacity 0.2s, background 0.3s" },
  separator:   { display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" },
  sepLine:     { flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" },
  sepText:     { color: "#555", fontSize: "12px", whiteSpace: "nowrap" },
  registerBtn: { display: "block", padding: "13px", textAlign: "center", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "30px", color: "#ddd", textDecoration: "none", fontSize: "14px", fontWeight: "600" },
};
