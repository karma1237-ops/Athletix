require("dotenv").config();
const app = require("./app");
const { connectMySQL, sequelize } = require("./config/mysql");
const { connectMongo } = require("./config/mongo");

// Chargement de tous les modèles (nécessaire pour que sequelize.sync les connaisse)
require("./models/mysql/index");

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectMySQL();

    // Crée ou met à jour toutes les tables automatiquement
    await sequelize.sync({ alter: true });
    console.log("✅ Tables MySQL synchronisées");

    await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur Athletix démarré sur http://localhost:${PORT}`);
      console.log(`📦 Environnement : ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Impossible de démarrer le serveur :", err);
    process.exit(1);
  }
};

start();
