/**
 * xssProtection.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Couche de protection XSS appliquée sur TOUS les inputs entrants :
 *   • req.body   — champs JSON / form-urlencoded
 *   • req.query  — paramètres d'URL (?page=1&action=<script>...)
 *   • req.params — segments de route (/produits/:id)
 *
 * Stratégie : on échappe les caractères HTML dangereux dans toutes les
 * chaînes de caractères reçues, récursivement (objets et tableaux imbriqués).
 * On utilise la lib `xss` (plus robuste qu'un simple replace) et on complète
 * avec notre propre stripDangerous pour les patterns les plus courants.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const xss = require("xss");

// ── Options de la lib xss ─────────────────────────────────────────────────────
// On refuse TOUT tag HTML — on veut du texte pur, pas du HTML sanitisé.
const XSS_OPTIONS = {
  whiteList:       {},          // aucune balise autorisée
  stripIgnoreTag:  true,        // supprime les balises non listées
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "form"],
};

// ── Patterns supplémentaires à bloquer ───────────────────────────────────────
const DANGEROUS_PATTERNS = [
  /javascript\s*:/gi,           // javascript:alert()
  /vbscript\s*:/gi,             // vbscript:...
  /data\s*:\s*text\/html/gi,    // data:text/html,...
  /on\w+\s*=/gi,                // onclick= onmouseover= etc.
  /<\s*script/gi,               // <script
  /<\s*\/\s*script/gi,          // </script>
  /<\s*iframe/gi,               // <iframe
  /<\s*object/gi,               // <object
  /<\s*embed/gi,                // <embed
  /expression\s*\(/gi,          // CSS expression(...)
  /url\s*\(\s*['"]?\s*javascript/gi, // CSS url(javascript:)
];

/**
 * Nettoie une valeur de type string.
 * @param {string} value
 * @returns {string}
 */
function sanitizeString(value) {
  // 1. Passer dans la lib xss (échappe & supprime les balises)
  let clean = xss(value, XSS_OPTIONS);

  // 2. Supprimer les patterns dangereux résiduels
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, "");
  }

  // 3. Normaliser les null bytes (technique de bypass courante)
  clean = clean.replace(/\0/g, "");

  return clean;
}

/**
 * Parcourt récursivement un objet/tableau/valeur primitive
 * et sanitize toutes les chaînes trouvées.
 * @param {*} data
 * @returns {*}
 */
function sanitizeDeep(data) {
  if (typeof data === "string") {
    return sanitizeString(data);
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeDeep);
  }
  if (data !== null && typeof data === "object") {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize aussi les clés (protection HPP / pollution)
      const cleanKey = sanitizeString(String(key));
      result[cleanKey] = sanitizeDeep(value);
    }
    return result;
  }
  // number, boolean, null, undefined → inchangés
  return data;
}

// ── Middleware Express ────────────────────────────────────────────────────────
/**
 * Applique la sanitization XSS sur body, query et params.
 * À monter UNE FOIS globalement dans app.js, après les parsers.
 */
function xssProtection(req, res, next) {
  if (req.body   && typeof req.body   === "object") req.body   = sanitizeDeep(req.body);
  if (req.query  && typeof req.query  === "object") req.query  = sanitizeDeep(req.query);
  if (req.params && typeof req.params === "object") req.params = sanitizeDeep(req.params);
  next();
}

// ── Export aussi sanitizeDeep pour usage manuel dans les controllers ──────────
module.exports = { xssProtection, sanitizeDeep, sanitizeString };
