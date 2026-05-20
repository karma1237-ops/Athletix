const jwtService = require("../services/jwtService");

// ── Vérifier l'Access Token JWT ───────────────────────────────────────────────
<<<<<<< HEAD
const verifyToken = async (req, res, next) => {
=======
const verifyToken = (req, res, next) => {
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token d'accès manquant." });
  }
<<<<<<< HEAD

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwtService.verifyAccessToken(token);
=======
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwtService.verifyAccessToken(token);
    req.user = decoded;
    next();
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré.", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ message: "Token invalide." });
  }
<<<<<<< HEAD

  // ── Vérification que l'utilisateur existe toujours en BDD ────────────────
  // Cas concret : compte supprimé par un admin → son access token (15min)
  // serait encore valide sans cette vérification.
  // On fait la requête BDD uniquement si l'id est présent dans le payload.
  if (decoded?.id) {
    try {
      const { Utilisateur } = require("../models/mysql/Utilisateur");
      const user = await Utilisateur.findByPk(decoded.id, {
        attributes: ["id_utilisateur", "role"],
      });

      if (!user) {
        // Compte supprimé → on rejette le token même s'il est cryptographiquement valide
        return res.status(401).json({
          message: "Compte introuvable ou supprimé.",
          code: "USER_NOT_FOUND",
        });
      }

      // Mettre à jour le rôle depuis la BDD (au cas où il aurait changé depuis l'émission du token)
      decoded.role = user.role;
    } catch (dbErr) {
      console.error("[verifyToken] Erreur vérification BDD :", dbErr.message);
      // Fail-open : si la BDD est injoignable, on laisse passer avec le payload du token
      // Ajuster en fail-close selon les besoins de sécurité :
      // return res.status(503).json({ message: "Service temporairement indisponible." });
    }
  }

  req.user = decoded;
  next();
=======
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
};

// ── Vérifier le rôle admin ────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Non authentifié." });
<<<<<<< HEAD
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  }
=======
  if (req.user.role !== "admin") return res.status(403).json({ message: "Accès réservé aux administrateurs." });
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
  next();
};

module.exports = { verifyToken, isAdmin };
<<<<<<< HEAD

=======
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
