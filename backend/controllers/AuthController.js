const authService = require("../services/authService");
const jwtService  = require("../services/jwtService");

class AuthController {
  // ── POST /api/auth/register ───────────────────────────────────────────────
  async register(req, res) {
    try {
      const { nom, prenom, email, password } = req.body;
      if (!nom || !prenom || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
      }
      const user = await authService.register({ nom, prenom, email, password });
      return res.status(201).json({ message: "Inscription réussie.", user });
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  }

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis." });
      }
      const result = await authService.login({
        email,
        password,
        clientIp: req.clientIp,
      });
      res.cookie(
        "refreshToken",
        result.refreshTokenRaw,
        jwtService.getRefreshCookieOptions(result.refreshTokenExpiry)
      );
      return res.status(200).json({ accessToken: result.accessToken, user: result.user });
    } catch (err) {
      // Propager waitSeconds et attemptsLeft pour le frontend
      return res.status(err.status || 500).json({
        message:      err.message,
        waitSeconds:  err.waitSeconds  ?? undefined,
        lockedUntil:  err.lockedUntil  ?? undefined,
        attemptsLeft: err.attemptsLeft ?? undefined,
      });
    }
  }

  // ── POST /api/auth/refresh ────────────────────────────────────────────────
  async refresh(req, res) {
    try {
      const rawToken = req.cookies["refreshToken"];
      if (!rawToken) {
        return res.status(401).json({ message: "Refresh token manquant." });
      }
      const result = await authService.refresh(rawToken);
      res.cookie(
        "refreshToken",
        result.refreshTokenRaw,
        jwtService.getRefreshCookieOptions(result.refreshTokenExpiry)
      );
      return res.status(200).json({ accessToken: result.accessToken, user: result.user });
    } catch (err) {
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(err.status || 500).json({ message: err.message });
    }
  }

  // ── POST /api/auth/logout ─────────────────────────────────────────────────
  async logout(req, res) {
    try {
      if (req.user?.id) await authService.logout(req.user.id);
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(200).json({ message: "Déconnexion réussie." });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // ── GET /api/auth/me ──────────────────────────────────────────────────────
  async me(req, res) {
    try {
      const UserRepository = require("../repositories/UserRepository");
      const user = await UserRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new AuthController();
