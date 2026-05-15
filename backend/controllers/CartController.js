const { Panier } = require("../models/mongo");
const { Produit } = require("../models/mysql/index");

const TTL_DAYS = 7;

function expiryDate() {
  return new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
}

class CartController {
  // GET /api/cart
  async getCart(req, res) {
    try {
      let panier = await Panier.findOne({ utilisateur_id: req.user.id });
      if (!panier) panier = { utilisateur_id: req.user.id, produits: [] };
      res.json(panier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // POST /api/cart/add  { id_produit, quantite }
  async addItem(req, res) {
    try {
      const { id_produit, quantite = 1 } = req.body;
      if (!id_produit) return res.status(400).json({ message: "id_produit requis." });

      const qty = parseInt(quantite);

      // Vérifie que le produit existe en BDD MySQL
      const produit = await Produit.findByPk(id_produit);
      if (!produit) return res.status(404).json({ message: "Produit introuvable." });

      let panier = await Panier.findOne({ utilisateur_id: req.user.id });

      if (!panier) {
        // Créer un panier si qty > 0
        if (qty <= 0) return res.status(400).json({ message: "Quantité invalide." });
        panier = new Panier({
          utilisateur_id: req.user.id,
          expire_le: expiryDate(),
          produits: [{
            id_produit: produit.id_produit,
            nom: produit.nom,
            prix: parseFloat(produit.prix),
            img1: produit.img1 || null,
            quantite: qty,
          }],
        });
      } else {
        const idx = panier.produits.findIndex(p => p.id_produit === id_produit);
        if (idx >= 0) {
          const newQty = panier.produits[idx].quantite + qty;
          if (newQty <= 0) {
            panier.produits.splice(idx, 1);
          } else {
            panier.produits[idx].quantite = Math.min(newQty, produit.stock);
          }
        } else {
          if (qty <= 0) return res.status(400).json({ message: "Quantité invalide." });
          panier.produits.push({
            id_produit: produit.id_produit,
            nom: produit.nom,
            prix: parseFloat(produit.prix),
            img1: produit.img1 || null,
            quantite: Math.min(qty, produit.stock),
          });
        }
        panier.expire_le = expiryDate();
        panier.markModified("produits");
      }

      await panier.save();
      res.json(panier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // DELETE /api/cart/remove/:id
  async removeItem(req, res) {
    try {
      const id_produit = parseInt(req.params.id);
      const panier = await Panier.findOne({ utilisateur_id: req.user.id });
      if (!panier) return res.json({ utilisateur_id: req.user.id, produits: [] });

      panier.produits = panier.produits.filter(p => p.id_produit !== id_produit);
      panier.markModified("produits");
      await panier.save();
      res.json(panier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // DELETE /api/cart
  async clearCart(req, res) {
    try {
      await Panier.deleteOne({ utilisateur_id: req.user.id });
      res.json({ message: "Panier vidé." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new CartController();
