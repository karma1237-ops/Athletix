const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

const Produit = sequelize.define("Produit", {
  id_produit: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  prix: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  promotions: { type: DataTypes.TINYINT, defaultValue: 0 },
  en_vedette: { type: DataTypes.TINYINT, defaultValue: 0 },
  img1: DataTypes.STRING(255),
  img2: DataTypes.STRING(255),
  img3: DataTypes.STRING(255),
  date_ajout: DataTypes.DATE,
  id_categorie: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false 
  },
}, {
  tableName: "produits",
  timestamps: false,
});

module.exports = Produit;