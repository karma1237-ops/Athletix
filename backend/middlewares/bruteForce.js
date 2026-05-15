/**
 * bruteForce.js
 * Protection anti brute-force basée sur l'IP.
 *
 * Fonctionnement :
 *   1. bruteForceGuard (middleware) : bloque la requête si l'IP est verrouillée → 429
 *   2. recordFailedAttempt         : appelé par authService après chaque échec
 *   3. resetAttempts               : appelé par authService après un succès
 *
 * La réponse 429 contient :
 *   { message, lockedUntil, waitSeconds }
 * → le frontend utilise waitSeconds pour afficher le timer.
 */

const { LoginAttempts } = require("../models/mysql/LoginAttempts");

const MAX_ATTEMPTS   = 3;             // tentatives avant verrouillage
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes en ms

// ── Helper interne ────────────────────────────────────────────────────────────
async function getOrCreateRecord(ip) {
  let record = await LoginAttempts.findOne({ where: { ip_adresse: ip } });
  if (!record) {
    record = await LoginAttempts.create({
      ip_adresse:    ip,
      AttemptCount:  0, // Reprends après la duree du verrouillage, pas de reset immédiat
      LastAttempt:   null,
      LockedUntil:   null,
      id_utilisateur: null,
    });
  }
  return record;
}

// ── recordFailedAttempt ───────────────────────────────────────────────────────
/**
 * Incrémente le compteur après un échec de connexion.
 * Verrouille l'IP si MAX_ATTEMPTS est atteint.
 * @returns {{ newCount: number, lockedUntil: Date|null, waitSeconds: number }}
 */
async function recordFailedAttempt(ip, utilisateur_id = null) {
  try {
    const record = await getOrCreateRecord(ip);
    const now    = new Date();

    // Si le verrou précédent est expiré → repart de zéro
    const lockExpired = record.LockedUntil && record.LockedUntil <= now;
    const newCount    = lockExpired ? 1 : (record.AttemptCount || 0) + 1;

    const lockedUntil =
      newCount >= MAX_ATTEMPTS
        ? new Date(now.getTime() + LOCK_DURATION)
        : null;

    await record.update({
      AttemptCount:   newCount,
      LastAttempt:    now,
      LockedUntil:    lockedUntil,
      id_utilisateur: utilisateur_id ?? record.id_utilisateur,
    });

    const waitSeconds = lockedUntil
      ? Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000)
      : 0;

    return { newCount, lockedUntil, waitSeconds };
  } catch (err) {
    console.error("[bruteForce] recordFailedAttempt erreur :", err.message);
    return { newCount: 0, lockedUntil: null, waitSeconds: 0 };
  }
}

// ── resetAttempts ─────────────────────────────────────────────────────────────
/**
 * Réinitialise le compteur après une connexion réussie.
 */
async function resetAttempts(ip) {
  try {
    await LoginAttempts.update(
      { AttemptCount: 0, LockedUntil: null, LastAttempt: new Date() },
      { where: { ip_adresse: ip } }
    );
  } catch (err) {
    console.error("[bruteForce] resetAttempts erreur :", err.message);
  }
}

// ── bruteForceGuard ───────────────────────────────────────────────────────────
/**
 * Middleware Express.
 * Bloque la requête si l'IP est verrouillée.
 * Retourne 429 avec { message, lockedUntil, waitSeconds }.
 */
async function bruteForceGuard(req, res, next) {
  // Récupère l'IP réelle (derrière un proxy si X-Forwarded-For est configuré)
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    req.connection.remoteAddress ||
    "unknown";

  req.clientIp = ip; // transmis aux helpers en aval

  try {
    const record = await LoginAttempts.findOne({ where: { ip_adresse: ip } });

    if (record && record.LockedUntil && record.LockedUntil > new Date()) {
      const waitSeconds = Math.ceil(
        (record.LockedUntil.getTime() - Date.now()) / 1000
      );
      return res.status(429).json({
        message:     `Trop de tentatives échouées. Réessayez dans ${waitSeconds} seconde(s).`,
        lockedUntil: record.LockedUntil,
        waitSeconds,             // ← clé utilisée par le frontend pour le timer
        attemptsLeft: 0,
      });
    }

    // Indique le nb de tentatives restantes dans l'en-tête (optionnel, utile pour debug)
    if (record && record.AttemptCount > 0) {
      const remaining = MAX_ATTEMPTS - record.AttemptCount;
      res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
    }

    next();
  } catch (err) {
    console.error("[bruteForceGuard] Erreur :", err.message);
    next(); // fail-open : en cas de panne DB on laisse passer
  }
}

module.exports = { bruteForceGuard, recordFailedAttempt, resetAttempts, MAX_ATTEMPTS };
