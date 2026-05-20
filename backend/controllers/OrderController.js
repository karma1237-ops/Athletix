const { Panier } = require("../models/mongo");
const { LogAdmin } = require("../models/mongo");
const { Produit, Commande, LigneCommande, Adresse, ModePaiement } = require("../models/mysql/index");
const { sequelize } = require("../config/mysql");

// ── Simulation paiement ────────────────────────────────────────────────────────
function simulatePaiement({ numero_carte, expiration, cvv }) {
  // Numéro de test refusé : commence par 0000
  if (!numero_carte || numero_carte.replace(/\s/g, "").startsWith("0000")) {
    return { success: false, code: "CARD_DECLINED", message: "Carte refusée." };
  }
  // Expiration dépassée
  if (expiration) {
    const [mm, yy] = expiration.split("/");
    const exp = new Date(2000 + parseInt(yy), parseInt(mm) - 1, 1);
    if (exp < new Date()) {
      return { success: false, code: "CARD_EXPIRED", message: "Carte expirée." };
    }
  }
  // CVV manquant
  if (!cvv || cvv.length < 3) {
    return { success: false, code: "INVALID_CVV", message: "CVV invalide." };
  }
  // Tout OK → paiement accepté (simulation)
  return { success: true, transaction_id: "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 9999) };
}

class OrderController {
  // POST /api/orders/checkout
  async checkout(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        // Adresse
        numero, rue, codepostal, ville, pays,
        // Paiement
        type_paiement, // "visa" | "paypal"
        numero_carte, expiration, cvv,
      } = req.body;

      // 1. Récupère le panier Mongo
      const panier = await Panier.findOne({ utilisateur_id: req.user.id });
      if (!panier || panier.produits.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: "Votre panier est vide." });
      }

      // 2. Simulation paiement
      const paiementResult = simulatePaiement({ numero_carte, expiration, cvv });
      if (!paiementResult.success) {
        await t.rollback();
        return res.status(402).json({
          message: paiementResult.message,
          code: paiementResult.code,
        });
      }

      // 3. Vérifie les stocks et calcule le montant
      let montant = 0;
      const lignes = [];
      for (const item of panier.produits) {
        const produit = await Produit.findByPk(item.id_produit, { transaction: t });
        if (!produit) {
          await t.rollback();
          return res.status(400).json({ message: `Produit "${item.nom}" introuvable.` });
        }
        if (produit.stock < item.quantite) {
          await t.rollback();
          return res.status(400).json({
            message: `Stock insuffisant pour "${produit.nom}" (${produit.stock} disponibles).`,
          });
        }
        montant += parseFloat(produit.prix) * item.quantite;
        lignes.push({ produit, quantite: item.quantite, prix: parseFloat(produit.prix) });
      }

      // 4. Crée l'adresse
      const adresse = await Adresse.create({ numero: numero || 1, rue, codepostal, ville, pays: pays || "France" }, { transaction: t });

      // 5. Crée le mode de paiement
      const modePaiement = await ModePaiement.create(
        { type_paiement: type_paiement || "visa" },
        { transaction: t }
      );

      // 6. Crée la commande
      const commande = await Commande.create({
        utilisateur_id: req.user.id,
        statut: "en_attente",
        montant_hors_taxe_commande: montant.toFixed(2),
        id_paiement: modePaiement.id_paiement,
        id_adresse: adresse.id_adresse,
      }, { transaction: t });

      // 7. Crée les lignes de commande + décrémente le stock
      for (const l of lignes) {
        await LigneCommande.create({
          id_commande: commande.id_commande,
          id_produit:  l.produit.id_produit,
          quantite:    l.quantite,
          prix:        l.prix,
        }, { transaction: t });

        await l.produit.update(
          { stock: l.produit.stock - l.quantite },
          { transaction: t }
        );
      }

      await t.commit();

      // 8. Vide le panier Mongo
      await Panier.deleteOne({ utilisateur_id: req.user.id });

      // 9. Log admin
      await LogAdmin.create({
        utilisateur_id: req.user.id,
        action: "COMMANDE_PASSEE",
        details: {
          id_commande: commande.id_commande,
          montant: montant.toFixed(2),
          transaction_id: paiementResult.transaction_id,
          produits: lignes.map(l => ({ id: l.produit.id_produit, nom: l.produit.nom, qty: l.quantite })),
        },
      });

      return res.status(201).json({
        message: "Commande passée avec succès.",
        commande: {
          id_commande: commande.id_commande,
          montant: montant.toFixed(2),
          statut: commande.statut,
          transaction_id: paiementResult.transaction_id,
        },
      });
    } catch (err) {
      await t.rollback();
      console.error("Erreur checkout:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // GET /api/orders/my
  async getMyOrders(req, res) {
    try {
      const commandes = await Commande.findAll({
        where: { utilisateur_id: req.user.id },
        include: [
          {
            model: LigneCommande,
            include: [{ model: Produit, attributes: ["nom", "img1"] }],
          },
          { model: Adresse },
        ],
        order: [["id_commande", "DESC"]],
      });
      res.json(commandes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new OrderController();
