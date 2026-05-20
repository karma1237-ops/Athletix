/**
 * useFormInput.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook de gestion de formulaire avec :
 *   1. Sanitization XSS à chaque frappe (DOMPurify)
 *   2. Validation côté client avec feedback immédiat
 *   3. Préparation du payload propre avant envoi API
 *
 * Usage :
 *   const { values, errors, handleChange, getPayload, isValid } = useFormInput({
 *     nom:   { initial: "", required: true, minLength: 2, maxLength: 50 },
 *     email: { initial: "", required: true, type: "email" },
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useMemo } from "react";
import { sanitize, sanitizeObject } from "./useSanitize";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_REGEX   = /^https?:\/\/.+/;

/**
 * Valide une valeur selon sa règle.
 * @returns {string} message d'erreur ou ""
 */
function validateField(name, value, rule) {
  const v = String(value ?? "").trim();

  if (rule.required && v === "") return `Ce champ est requis.`;
  if (v === "") return "";

  if (rule.type === "email" && !EMAIL_REGEX.test(v))
    return "Adresse e-mail invalide.";

  if (rule.type === "url" && !URL_REGEX.test(v))
    return "URL invalide (doit commencer par https://).";

  if (rule.minLength && v.length < rule.minLength)
    return `Minimum ${rule.minLength} caractères requis.`;

  if (rule.maxLength && v.length > rule.maxLength)
    return `Maximum ${rule.maxLength} caractères autorisés.`;

  if (rule.type === "number") {
    const n = parseFloat(v);
    if (isNaN(n)) return "Doit être un nombre.";
    if (rule.min !== undefined && n < rule.min) return `Valeur minimale : ${rule.min}.`;
    if (rule.max !== undefined && n > rule.max) return `Valeur maximale : ${rule.max}.`;
  }

  if (rule.type === "integer") {
    const n = parseInt(v, 10);
    if (isNaN(n) || !Number.isInteger(n)) return "Doit être un entier.";
    if (rule.min !== undefined && n < rule.min) return `Valeur minimale : ${rule.min}.`;
    if (rule.max !== undefined && n > rule.max) return `Valeur maximale : ${rule.max}.`;
  }

  if (rule.enum && !rule.enum.includes(v))
    return `Valeur non autorisée.`;

  if (rule.pattern && !rule.pattern.test(v))
    return rule.patternMessage || "Format invalide.";

  return "";
}

/**
 * @param {Record<string, {
 *   initial?: any,
 *   required?: boolean,
 *   type?: "text"|"email"|"url"|"number"|"integer",
 *   minLength?: number,
 *   maxLength?: number,
 *   min?: number,
 *   max?: number,
 *   enum?: string[],
 *   pattern?: RegExp,
 *   patternMessage?: string,
 *   sanitize?: boolean,  // true par défaut
 * }>} schema
 */
export function useFormInput(schema) {
  // Initialiser les valeurs
  const initValues = Object.fromEntries(
    Object.entries(schema).map(([k, r]) => [k, r.initial ?? ""])
  );
  const [values, setValues]   = useState(initValues);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  // Changer un champ : sanitize + validation en live
  const handleChange = useCallback((name, rawValue) => {
    const rule = schema[name] || {};
    // Sanitize (sauf si explicitement désactivé)
    const shouldSanitize = rule.sanitize !== false;
    const value = shouldSanitize && typeof rawValue === "string"
      ? sanitize(rawValue)
      : rawValue;

    setValues(prev => ({ ...prev, [name]: value }));

    // Valider seulement si le champ a été touché
    if (touched[name]) {
      const err = validateField(name, value, rule);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  }, [schema, touched]);

  // Marquer un champ comme touché (onBlur) et valider
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const rule = schema[name] || {};
    const err  = validateField(name, values[name], rule);
    setErrors(prev => ({ ...prev, [name]: err }));
  }, [schema, values]);

  // Valider TOUS les champs (à l'envoi du formulaire)
  const validateAll = useCallback(() => {
    const newErrors = {};
    const newTouched = {};
    for (const [name, rule] of Object.entries(schema)) {
      newTouched[name] = true;
      newErrors[name]  = validateField(name, values[name], rule);
    }
    setTouched(newTouched);
    setErrors(newErrors);
    return Object.values(newErrors).every(e => e === "");
  }, [schema, values]);

  // Le formulaire est valide si aucune erreur dans les règles requises
  const isValid = useMemo(() => {
    return Object.entries(schema).every(([name, rule]) => {
      const err = validateField(name, values[name], rule);
      return err === "";
    });
  }, [schema, values]);

  // Retourner le payload sanitisé prêt à envoyer
  const getPayload = useCallback(() => sanitizeObject(values), [values]);

  // Réinitialiser le formulaire
  const reset = useCallback(() => {
    setValues(initValues);
    setErrors({});
    setTouched({});
  }, []);

  return { values, errors, touched, handleChange, handleBlur, validateAll, isValid, getPayload, reset, setValues };
}

export default useFormInput;
