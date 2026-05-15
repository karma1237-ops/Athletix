const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

const Utilisateur = sequelize.define(
  "utilisateurs",
  {
    id_utilisateur: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 50] },
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 50] },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("client", "admin"),
      defaultValue: "client",
      allowNull: false,
    },
    // Refresh Token — stocké hashé (jamais en clair)
    refresh_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    refresh_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    date_inscription: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "utilisateurs",
    timestamps: false,
  }
);

module.exports = { Utilisateur };
