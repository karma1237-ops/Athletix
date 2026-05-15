const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

const RefreshToken = sequelize.define(
  "refresh_tokens",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    utilisateur_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    RevokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: false,
  }
);

module.exports = { RefreshToken };
