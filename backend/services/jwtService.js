const jwt    = require("jsonwebtoken");
const argon2 = require("argon2");
const crypto = require("crypto");

const ARGON2_OPTIONS = {
  type:         argon2.argon2id,
  memoryCost:   19456,
  timeCost:     2,
  parallelism:  1,
};

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

class JwtService {
  // ── Access Token (JWT signé, 15 min) ─────────────────────────────────────
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer:    "athletix-api",
      audience:  "athletix-client",
    });
  }

  // ── Refresh Token (UUID opaque hashé Argon2id) ────────────────────────────
  async generateRefreshToken() {
    const rawToken  = crypto.randomBytes(64).toString("hex");
    const tokenHash = await argon2.hash(rawToken, ARGON2_OPTIONS);
    const expiry    = new Date(Date.now() + REFRESH_EXPIRES_MS);
    return { rawToken, tokenHash, expiry };
  }

  // ── Paire Access + Refresh ────────────────────────────────────────────────
  async generateTokenPair(user) {
    const payload = { id: user.id_utilisateur, email: user.email, role: user.role };
    const accessToken = this.generateAccessToken(payload);
    const { rawToken, tokenHash, expiry } = await this.generateRefreshToken();
    return {
      accessToken,
      refreshTokenRaw:    rawToken,
      refreshTokenHash:   tokenHash,
      refreshTokenExpiry: expiry,
    };
  }

  // ── Vérifier Access Token ─────────────────────────────────────────────────
  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer:   "athletix-api",
      audience: "athletix-client",
    });
  }

  // ── Vérifier Refresh Token brut contre hash BDD ───────────────────────────
  async verifyRefreshToken(rawToken, storedHash) {
    if (!rawToken || !storedHash) return false;
    try {
      return await argon2.verify(storedHash, rawToken);
    } catch {
      return false;
    }
  }

  // ── Options cookie HttpOnly (OWASP) ───────────────────────────────────────
  getRefreshCookieOptions(expiry) {
    return {
      httpOnly: true,
      secure:   process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      expires:  expiry,
      path:     "/api/auth",
    };
  }
}

module.exports = new JwtService();
