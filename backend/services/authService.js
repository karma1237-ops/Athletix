const argon2         = require("argon2");
const jwtService     = require("./jwtService");
const UserRepository = require("../repositories/UserRepository");
const { recordFailedAttempt, resetAttempts, MAX_ATTEMPTS } = require("../middlewares/bruteForce");

const ARGON2_OPTIONS = {
  type:        argon2.argon2id,
  memoryCost:  19456,
  timeCost:    2,
  parallelism: 1,
};

class AuthService {
  // ══ INSCRIPTION ════════════════════════════════════════════════════════════
  async register({ nom, prenom, email, password }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      const err = new Error("Cet email est déjà utilisé.");
      err.status = 409;
      throw err;
    }
    const mot_de_passe = await argon2.hash(password, ARGON2_OPTIONS);
    const user = await UserRepository.create({ nom, prenom, email, mot_de_passe });
    return {
      id:     user.id_utilisateur,
      nom:    user.nom,
      prenom: user.prenom,
      email:  user.email,
      role:   user.role,
    };
  }

  // ══ CONNEXION ══════════════════════════════════════════════════════════════
  async login({ email, password, clientIp }) {
<<<<<<< HEAD
    const ip = clientIp || "unknown";

    // ── ÉTAPE 1 : Vérifier l'email ─────────────────────────────────────────
    // On cherche l'utilisateur EN PREMIER. Si l'email n'existe pas, inutile
    // d'aller plus loin — on ne vérifie PAS le mot de passe.
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      // ── Protection timing attack ──────────────────────────────────────────
      // Sans ce hash factice, l'absence de argon2.verify (~200ms) rendrait
      // les réponses "email inconnu" nettement plus rapides que "mauvais mdp",
      // permettant à un attaquant d'énumérer les emails valides par le temps
      // de réponse. On simule le délai pour rendre les deux cas indiscernables.
      await argon2.hash("dummy_password_timing_protection", ARGON2_OPTIONS);

      const result = await recordFailedAttempt(ip, null);
      const err    = new Error("Identifiants invalides.");
      err.status   = 401;
=======
    const ip   = clientIp || "unknown";
    const user = await UserRepository.findByEmail(email);

    // Email introuvable
    if (!user) {
      const result = await recordFailedAttempt(ip, null);
      const err    = new Error("Identifiants invalides.");
      err.status   = 401;
      // Si le verrou vient de se déclencher sur cette tentative, on le signale
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
      if (result.lockedUntil) {
        err.status      = 429;
        err.message     = `Trop de tentatives échouées. Réessayez dans ${result.waitSeconds} seconde(s).`;
        err.lockedUntil = result.lockedUntil;
        err.waitSeconds = result.waitSeconds;
      } else {
        err.attemptsLeft = Math.max(0, MAX_ATTEMPTS - result.newCount);
      }
      throw err;
    }

<<<<<<< HEAD
    // ── ÉTAPE 2 : Vérifier le mot de passe ────────────────────────────────
    // On n'arrive ici que si l'email existe.
    const valid = await argon2.verify(user.mot_de_passe, password);

=======
    // Mot de passe incorrect
    const valid = await argon2.verify(user.mot_de_passe, password);
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
    if (!valid) {
      const result = await recordFailedAttempt(ip, user.id_utilisateur);
      const err    = new Error("Identifiants invalides.");
      err.status   = 401;
      if (result.lockedUntil) {
        err.status      = 429;
        err.message     = `Trop de tentatives échouées. Réessayez dans ${result.waitSeconds} seconde(s).`;
        err.lockedUntil = result.lockedUntil;
        err.waitSeconds = result.waitSeconds;
      } else {
        err.attemptsLeft = Math.max(0, MAX_ATTEMPTS - result.newCount);
      }
      throw err;
    }

<<<<<<< HEAD
    // ── ÉTAPE 3 : Succès ──────────────────────────────────────────────────
=======
    // ── Succès ────────────────────────────────────────────────────────────────
>>>>>>> e1feae0dd91be950fd1e619e155ba18d2ab31576
    await resetAttempts(ip);

    const tokens = await jwtService.generateTokenPair(user);
    await UserRepository.saveRefreshToken(
      user.id_utilisateur,
      tokens.refreshTokenHash,
      tokens.refreshTokenExpiry
    );

    return {
      accessToken:        tokens.accessToken,
      refreshTokenRaw:    tokens.refreshTokenRaw,
      refreshTokenExpiry: tokens.refreshTokenExpiry,
      user: {
        id:     user.id_utilisateur,
        nom:    user.nom,
        prenom: user.prenom,
        email:  user.email,
        role:   user.role,
      },
    };
  }

  // ══ REFRESH TOKEN (rotation) ═══════════════════════════════════════════════
  async refresh(rawToken) {
    if (!rawToken) {
      const err = new Error("Refresh token manquant.");
      err.status = 401;
      throw err;
    }
    const { Utilisateur } = require("../models/mysql/Utilisateur");
    const { RefreshToken } = require("../models/mysql/RefreshToken");
    const { Op } = require("sequelize");

    const activeTokens = await RefreshToken.findAll({
      where: { expiry: { [Op.gt]: new Date() }, RevokedAt: null },
    });

    let matchedToken = null;
    let matchedUser  = null;

    for (const rt of activeTokens) {
      const match = await jwtService.verifyRefreshToken(rawToken, rt.token_hash);
      if (match) {
        matchedToken = rt;
        matchedUser  = await Utilisateur.findByPk(rt.utilisateur_id);
        break;
      }
    }

    if (!matchedToken || !matchedUser) {
      const err = new Error("Refresh token invalide ou expiré.");
      err.status = 401;
      throw err;
    }

    const tokens = await jwtService.generateTokenPair(matchedUser);
    await UserRepository.saveRefreshToken(
      matchedUser.id_utilisateur,
      tokens.refreshTokenHash,
      tokens.refreshTokenExpiry
    );

    return {
      accessToken:        tokens.accessToken,
      refreshTokenRaw:    tokens.refreshTokenRaw,
      refreshTokenExpiry: tokens.refreshTokenExpiry,
      user: {
        id:     matchedUser.id_utilisateur,
        nom:    matchedUser.nom,
        prenom: matchedUser.prenom,
        email:  matchedUser.email,
        role:   matchedUser.role,
      },
    };
  }

  // ══ DÉCONNEXION ═══════════════════════════════════════════════════════════
  async logout(userId) {
    await UserRepository.revokeRefreshToken(userId);
  }
}

module.exports = new AuthService();
