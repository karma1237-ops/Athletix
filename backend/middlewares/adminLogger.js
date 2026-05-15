const { LogAdmin } = require("../models/mongo");

/**
 * Middleware factory — à brancher sur les routes admin qui mutent des données.
 * Usage : router.post("/produits", verifyToken, isAdmin, logAdminAction("PRODUIT_CREE"), AdminController.createProduit)
 */
function logAdminAction(action, getDetails = (req, res_body) => res_body) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      // On ne loggue que si la réponse est un succès (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await LogAdmin.create({
            utilisateur_id: req.user.id,
            action,
            details: getDetails(req, body),
          });
        } catch (e) {
          console.error("[logAdminAction] Erreur log:", e.message);
        }
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { logAdminAction };
