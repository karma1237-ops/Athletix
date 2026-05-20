const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

const LoginAttempts = sequelize.define(
  "LoginAttempts",
  {
    id_LoginAttempts: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    ip_adresse: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    AttemptCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    LastAttempt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    LockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    id_utilisateur: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true, // nullable : l'IP peut tenter sans que l'utilisateur existe
    },
  },
  {
    tableName: "LoginAttempts",
    timestamps: false,
  }
);

module.exports = { LoginAttempts };
