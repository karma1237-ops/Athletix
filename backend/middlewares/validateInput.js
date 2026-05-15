/**
 * validateInput.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation typée des champs par route, complémentaire à la sanitization XSS.
 * Utilise la lib `validator` pour des règles précises (email, longueur, type…).
 *
 * Usage dans une route :
 *   router.post("/register", validate(RULES.register), AuthController.register)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const validator = require("validator");

// ── Règles par contexte ───────────────────────────────────────────────────────
const RULES = {
  // Auth
  register: {
    nom:      { type: "string", min: 2, max: 50,  required: true },
    prenom:   { type: "string", min: 2, max: 50,  required: true },
    email:    { type: "email",  max: 255,          required: true },
    password: { type: "string", min: 8, max: 128, required: true },
  },
  login: {
    email:    { type: "email",  max: 255, required: true },
    password: { type: "string", min: 1,  max: 128, required: true },
  },

  // Panier
  cartAdd: {
    id_produit: { type: "integer", min: 1, required: true },
    quantite:   { type: "integer", min: 1, max: 99 },
  },

  // Checkout
  checkout: {
    rue:           { type: "string", min: 2, max: 150, required: true },
    codepostal:    { type: "string", min: 2, max: 10,  required: true },
    ville:         { type: "string", min: 1, max: 80,  required: true },
    pays:          { type: "string", min: 1, max: 80 },
    type_paiement: { type: "enum",   values: ["visa", "paypal"], required: true },
    // Carte — uniquement si type_paiement === "visa"
    numero_carte:  { type: "string", min: 16, max: 16, conditionalOn: "type_paiement", conditionalValue: "visa" },
    expiration:    { type: "string", min: 5,  max: 5,  conditionalOn: "type_paiement", conditionalValue: "visa" },
    cvv:           { type: "string", min: 3,  max: 4,  conditionalOn: "type_paiement", conditionalValue: "visa" },
  },

  // Admin — produit
  produit: {
    nom:          { type: "string",  min: 1, max: 100, required: true },
    description:  { type: "string",  max: 2000 },
    prix:         { type: "number",  min: 0.01, required: true },
    stock:        { type: "integer", min: 0 },
    id_categorie: { type: "integer", min: 1,   required: true },
    img1:         { type: "url_or_empty" },
    img2:         { type: "url_or_empty" },
    img3:         { type: "url_or_empty" },
  },

  // Admin — utilisateur
  utilisateur: {
    nom:    { type: "string", min: 2, max: 50,  required: true },
    prenom: { type: "string", min: 2, max: 50,  required: true },
    email:  { type: "email",  max: 255,          required: true },
    role:   { type: "enum",   values: ["client", "admin"] },
  },

  // Admin — catégorie
  categorie: {
    nom_categorie: { type: "string", min: 2, max: 50, required: true },
    description:   { type: "string", max: 255 },
  },
};

// ── Moteur de validation ──────────────────────────────────────────────────────
function validateField(key, value, rule) {
  const errors = [];

  // Champ conditionnel (ex: cvv seulement si visa)
  if (rule.conditionalOn) return errors;

  // Requis
  if (rule.required && (value === undefined || value === null || value === "")) {
    errors.push(`Le champ "${key}" est requis.`);
    return errors;
  }
  if (value === undefined || value === null || value === "") return errors;

  const strVal = String(value);

  switch (rule.type) {
    case "email":
      if (!validator.isEmail(strVal)) errors.push(`"${key}" : adresse e-mail invalide.`);
      if (rule.max && strVal.length > rule.max) errors.push(`"${key}" dépasse ${rule.max} caractères.`);
      break;

    case "string":
      if (rule.min && strVal.length < rule.min) errors.push(`"${key}" doit contenir au moins ${rule.min} caractères.`);
      if (rule.max && strVal.length > rule.max) errors.push(`"${key}" dépasse ${rule.max} caractères.`);
      break;

    case "integer":
      if (!validator.isInt(strVal)) errors.push(`"${key}" doit être un entier.`);
      else {
        const n = parseInt(strVal, 10);
        if (rule.min !== undefined && n < rule.min) errors.push(`"${key}" doit être ≥ ${rule.min}.`);
        if (rule.max !== undefined && n > rule.max) errors.push(`"${key}" doit être ≤ ${rule.max}.`);
      }
      break;

    case "number":
      if (!validator.isFloat(strVal)) errors.push(`"${key}" doit être un nombre.`);
      else {
        const n = parseFloat(strVal);
        if (rule.min !== undefined && n < rule.min) errors.push(`"${key}" doit être ≥ ${rule.min}.`);
      }
      break;

    case "enum":
      if (!rule.values.includes(strVal)) {
        errors.push(`"${key}" doit être l'une des valeurs : ${rule.values.join(", ")}.`);
      }
      break;

    case "url_or_empty":
      if (strVal && !validator.isURL(strVal, { require_protocol: true })) {
        errors.push(`"${key}" doit être une URL valide (https://...).`);
      }
      break;

    default:
      break;
  }

  return errors;
}

/**
 * Factory de middleware de validation.
 * @param {object} rules — jeu de règles (objet de RULES)
 */
function validate(rules) {
  return (req, res, next) => {
    const allErrors = [];
    const body = req.body || {};

    for (const [key, rule] of Object.entries(rules)) {
      // Gérer les champs conditionnels
      if (rule.conditionalOn) {
        const condVal = body[rule.conditionalOn];
        if (condVal !== rule.conditionalValue) continue;
        // Le champ conditionnel devient requis
        const adjustedRule = { ...rule, required: true };
        delete adjustedRule.conditionalOn;
        delete adjustedRule.conditionalValue;
        const errs = validateField(key, body[key], adjustedRule);
        allErrors.push(...errs);
        continue;
      }
      const errs = validateField(key, body[key], rule);
      allErrors.push(...errs);
    }

    if (allErrors.length > 0) {
      return res.status(422).json({ message: "Données invalides.", errors: allErrors });
    }
    next();
  };
}

module.exports = { validate, RULES };
