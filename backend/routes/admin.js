const express         = require("express");
const router          = express.Router();
const AdminController = require("../controllers/AdminController");
const { verifyToken, isAdmin } = require("../middlewares/auth");
const { logAdminAction } = require("../middlewares/adminLogger");
const { validate, RULES }    = require("../middlewares/validateInput");

router.use(verifyToken, isAdmin);

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get("/stats", AdminController.getStats.bind(AdminController));

// ── Utilisateurs ─────────────────────────────────────────────────────────────
router.get("/utilisateurs",
  AdminController.getUtilisateurs.bind(AdminController));

router.post("/utilisateurs",
  validate(RULES.utilisateur),
  logAdminAction("UTILISATEUR_CREE", (req) => ({ email: req.body.email, role: req.body.role })),
  AdminController.createUtilisateur.bind(AdminController));

router.put("/utilisateurs/:id",
  logAdminAction("UTILISATEUR_MAJ", (req) => ({ id: req.params.id, ...req.body })),
  AdminController.updateUtilisateur.bind(AdminController));

router.delete("/utilisateurs/:id",
  logAdminAction("UTILISATEUR_SUPPRIME", (req) => ({ id: req.params.id })),
  AdminController.deleteUtilisateur.bind(AdminController));

// ── Produits ──────────────────────────────────────────────────────────────────
router.get("/produits", AdminController.getProduits.bind(AdminController));

router.post("/produits",
  validate(RULES.produit),
  logAdminAction("PRODUIT_CREE", (req) => ({ nom: req.body.nom, prix: req.body.prix })),
  AdminController.createProduit.bind(AdminController));

router.put("/produits/:id",
  logAdminAction("PRODUIT_MAJ", (req) => ({ id: req.params.id, ...req.body })),
  AdminController.updateProduit.bind(AdminController));

router.delete("/produits/:id",
  logAdminAction("PRODUIT_SUPPRIME", (req) => ({ id: req.params.id })),
  AdminController.deleteProduit.bind(AdminController));

// ── Catégories ────────────────────────────────────────────────────────────────
router.get("/categories", AdminController.getCategories.bind(AdminController));

router.post("/categories",
  validate(RULES.categorie),
  logAdminAction("CATEGORIE_CREE", (req) => ({ nom: req.body.nom_categorie })),
  AdminController.createCategorie.bind(AdminController));

router.delete("/categories/:id",
  logAdminAction("CATEGORIE_SUPPRIMEE", (req) => ({ id: req.params.id })),
  AdminController.deleteCategorie.bind(AdminController));

// ── Commandes ─────────────────────────────────────────────────────────────────
router.get("/commandes", AdminController.getCommandes.bind(AdminController));

router.patch("/commandes/:id/statut",
  logAdminAction("COMMANDE_STATUT_MAJ", (req) => ({ id: req.params.id, statut: req.body.statut })),
  AdminController.updateStatutCommande.bind(AdminController));

module.exports = router;
