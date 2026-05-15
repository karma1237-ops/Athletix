const jwtService = require("../services/jwtService");

// ── Vérifier l'Access Token JWT ───────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token d'accès manquant." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwtService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré.", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ message: "Token invalide." });
  }
};

// ── Vérifier le rôle admin ────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Non authentifié." });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  next();
};

module.exports = { verifyToken, isAdmin };
