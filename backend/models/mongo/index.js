const mongoose = require("mongoose");

// ─── PANIER — TTL 7 jours (RG26) ─────────────────────────────────────────────
const produitPanierSchema = new mongoose.Schema({
  id_produit: { type: Number, required: true },
  nom:        { type: String, required: true },
  prix:       { type: Number, required: true },
  img1:       { type: String, default: null },
  quantite:   { type: Number, required: true, min: 1 },
}, { _id: false });

const panierSchema = new mongoose.Schema({
  utilisateur_id: { type: Number, required: true, unique: true },
  produits:       { type: [produitPanierSchema], default: [] },
  date_creation:  { type: Date, default: Date.now },
  expire_le:      { type: Date, required: true },
});
panierSchema.index({ expire_le: 1 }, { expireAfterSeconds: 0 });

// ─── FAVORIS — pas de TTL (RG30) ─────────────────────────────────────────────
const favoriSchema = new mongoose.Schema({
  id_produit: { type: Number, required: true },
  nom:        { type: String, required: true },
  prix:       { type: Number, required: true },
  img1:       { type: String, default: null },
}, { _id: false });

const favorisSchema = new mongoose.Schema({
  utilisateur_id:   { type: Number, required: true, unique: true },
  produits:         { type: [favoriSchema], default: [] },
  date_modification:{ type: Date, default: Date.now },
});

// ─── LOGS ADMIN — schéma flexible ─────────────────────────────────────────────
const logAdminSchema = new mongoose.Schema({
  utilisateur_id: { type: Number, required: true },
  action:         { type: String, required: true },
  details:        { type: mongoose.Schema.Types.Mixed, default: {} },
  date:           { type: Date, default: Date.now },
});

const Panier   = mongoose.model("Panier",   panierSchema);
const Favoris  = mongoose.model("Favoris",  favorisSchema);
const LogAdmin = mongoose.model("LogAdmin", logAdminSchema);

module.exports = { Panier, Favoris, LogAdmin };
