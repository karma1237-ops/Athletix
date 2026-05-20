/**
 * useSanitize.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook + fonctions utilitaires pour sanitizer les données XSS côté React.
 *
 * Note : React échappe automatiquement les valeurs dans les JSX comme {value},
 * mais cette couche protège les cas où innerHTML / dangerouslySetInnerHTML
 * serait utilisé, et valide les inputs avant envoi au serveur.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import DOMPurify from "dompurify";

// ── Config DOMPurify ──────────────────────────────────────────────────────────
const PURIFY_CONFIG = {
  ALLOWED_TAGS:  [],          // aucun tag HTML autorisé → texte pur
  ALLOWED_ATTR:  [],
  KEEP_CONTENT:  true,        // garder le texte entre les balises
  FORCE_BODY:    false,
};

/**
 * Sanitize une chaîne : supprime tout HTML/JS injecté.
 * Usage : const clean = sanitize(userInput)
 */
export function sanitize(value) {
  if (typeof value !== "string") return value;
  return DOMPurify.sanitize(value.trim(), PURIFY_CONFIG);
}

/**
 * Sanitize un objet entier récursivement.
 * Usage : const cleanBody = sanitizeObject(formData)
 */
export function sanitizeObject(obj) {
  if (typeof obj === "string") return sanitize(obj);
  if (Array.isArray(obj))      return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  return obj;
}

/**
 * sanitizeHtml — à utiliser UNIQUEMENT avec dangerouslySetInnerHTML.
 * Autorise un sous-ensemble restreint de tags (b, i, u, p, br).
 */
export function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS:  ["b", "i", "u", "em", "strong", "p", "br"],
    ALLOWED_ATTR:  [],
    FORCE_BODY:    false,
  });
}

/**
 * Hook useSanitize — retourne les fonctions prêtes à l'emploi.
 * Usage dans un composant :
 *   const { sanitize, sanitizeObject } = useSanitize();
 */
export function useSanitize() {
  return { sanitize, sanitizeObject, sanitizeHtml };
}

export default useSanitize;
