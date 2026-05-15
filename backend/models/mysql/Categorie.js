const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

const Categorie = sequelize.define("Categorie", {
  id_categorie: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  nom_categorie: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: DataTypes.STRING(255),
}, {
  tableName: "categories",
  timestamps: false,
});

module.exports = Categorie;