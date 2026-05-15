const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { timestamps: false, underscored: true },
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connecté");
  } catch (err) {
    console.error("❌ Erreur MySQL :", err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };
