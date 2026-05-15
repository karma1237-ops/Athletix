require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const helmet       = require("helmet");

const { xssProtection } = require("./middlewares/xssProtection");

const authRoutes    = require("./routes/auth");
const adminRoutes   = require("./routes/admin");
const productRoutes = require("./routes/productRoutes");
const cartRoutes    = require("./routes/cartRoutes");
const favorisRoutes = require("./routes/favorisRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const logsRoutes    = require("./routes/logsRoutes");

const app = express();

// ─── 1. Helmet — headers HTTP sécurisés ──────────────────────────────────────
// Content-Security-Policy, X-XSS-Protection, X-Content-Type-Options, etc.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'"],
        styleSrc:    ["'self'", "'unsafe-inline'"],  // inline styles nécessaires pour React
        imgSrc:      ["'self'", "data:", "https:"],  // images externes (produits)
        connectSrc:  ["'self'"],
        fontSrc:     ["'self'", "https://fonts.gstatic.com"],
        objectSrc:   ["'none'"],
        frameSrc:    ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,   // nécessaire pour certains assets
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ─── 2. CORS ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:         process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:    true,
    methods:        ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── 3. Parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));           // réduit de 10mb → 2mb (anti-bomb)
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// ─── 4. Protection XSS globale ───────────────────────────────────────────────
// DOIT être placé APRÈS les parsers, AVANT les routes
app.use(xssProtection);

// ─── 5. Routes ────────────────────────────────────────────────────────────────
// IMPORTANT : /api/admin/logs avant /api/admin
app.use("/api/auth",        authRoutes);
app.use("/api/admin/logs",  logsRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api",             productRoutes);
app.use("/api/cart",        cartRoutes);
app.use("/api/favoris",     favorisRoutes);
app.use("/api/orders",      orderRoutes);

// ─── 6. Santé ─────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// ─── 7. 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

// ─── 8. Erreur globale ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Erreur :", err);
  res.status(err.status || 500).json({ message: err.message || "Erreur serveur." });
});

module.exports = app;
