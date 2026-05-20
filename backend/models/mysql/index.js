const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const Categorie = sequelize.define("categories", {
  id_categorie: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nom_categorie: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: "categories", timestamps: false });

// ─── PRODUITS ─────────────────────────────────────────────────────────────────
const Produit = sequelize.define("produits", {
  id_produit: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  prix: { type: DataTypes.DECIMAL(15, 2), allowNull: false, validate: { min: 0.01 } },
  stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  promotions: { type: DataTypes.BOOLEAN, defaultValue: false },
  en_vedette: { type: DataTypes.BOOLEAN, defaultValue: false },
  img1: { type: DataTypes.STRING(255), allowNull: true },
  img2: { type: DataTypes.STRING(255), allowNull: true },
  img3: { type: DataTypes.STRING(255), allowNull: true },
  date_ajout: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  id_categorie: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, { tableName: "produits", timestamps: false });

// ─── ADRESSES ─────────────────────────────────────────────────────────────────
const Adresse = sequelize.define("adresses", {
  id_adresse: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  numero: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  rue: { type: DataTypes.STRING(100), allowNull: false },
  codepostal: { type: DataTypes.STRING(10), allowNull: false },
  ville: { type: DataTypes.STRING(50), allowNull: false },
  pays: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "France" },
}, { tableName: "adresses", timestamps: false });

// ─── MODE PAIEMENT ────────────────────────────────────────────────────────────
const ModePaiement = sequelize.define("mode_paiement", {
  id_paiement: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  type_paiement: { type: DataTypes.ENUM("visa", "paypal"), allowNull: false },
}, { tableName: "mode_paiement", timestamps: false });

// ─── COMMANDES ────────────────────────────────────────────────────────────────
const Commande = sequelize.define("commandes", {
  id_commande: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  statut: {
    type: DataTypes.ENUM("en_attente", "validee", "expediee", "livree"),
    defaultValue: "en_attente",
    allowNull: false,
  },
  montant_hors_taxe_commande: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  date_commande: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  id_paiement: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_adresse: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, { tableName: "commandes", timestamps: false });

// ─── LIGNE COMMANDE ───────────────────────────────────────────────────────────
const LigneCommande = sequelize.define("ligne_commande", {
  id_produit: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  id_commande: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  quantite: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, validate: { min: 1 } },
  prix: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
}, { tableName: "ligne_commande", timestamps: false });

// ─── REFRESH TOKENS ───────────────────────────────────────────────────────────
const RefreshToken = sequelize.define("refresh_tokens", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  CreatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  RevokedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  expiry: { type: DataTypes.DATE, allowNull: false },
}, { tableName: "refresh_tokens", timestamps: false });

// ─── LOGIN ATTEMPTS ───────────────────────────────────────────────────────────
const { LoginAttempts } = require("./LoginAttempts");

// ─── ASSOCIATIONS ─────────────────────────────────────────────────────────────
Produit.belongsTo(Categorie, { foreignKey: "id_categorie" });
Categorie.hasMany(Produit, { foreignKey: "id_categorie" });

// Associations améliorées pour le catalogue (avec alias)
Produit.belongsTo(Categorie, { 
  foreignKey: "id_categorie", 
  as: "categorie" 
});

Commande.hasMany(LigneCommande, { foreignKey: "id_commande" });
LigneCommande.belongsTo(Commande, { foreignKey: "id_commande" });
LigneCommande.belongsTo(Produit, { foreignKey: "id_produit" });
Commande.belongsTo(ModePaiement, { foreignKey: "id_paiement" });
Commande.belongsTo(Adresse, { foreignKey: "id_adresse" });

module.exports = { 
  Categorie, 
  Produit, 
  Adresse, 
  ModePaiement, 
  Commande, 
  LigneCommande, 
  RefreshToken, 
  LoginAttempts 
};