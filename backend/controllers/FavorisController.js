const { Favoris } = require("../models/mongo");
const { Produit } = require("../models/mysql/index");

class FavorisController {
  // GET /api/favoris
  async getFavoris(req, res) {
    try {
      let fav = await Favoris.findOne({ utilisateur_id: req.user.id });
      if (!fav) fav = { utilisateur_id: req.user.id, produits: [] };
      res.json(fav);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // POST /api/favoris/add  { id_produit }
  async addFavori(req, res) {
    try {
      const { id_produit } = req.body;
      if (!id_produit) return res.status(400).json({ message: "id_produit requis." });

      const produit = await Produit.findByPk(id_produit);
      if (!produit) return res.status(404).json({ message: "Produit introuvable." });

      let fav = await Favoris.findOne({ utilisateur_id: req.user.id });

      if (!fav) {
        fav = new Favoris({
          utilisateur_id: req.user.id,
          produits: [{
            id_produit: produit.id_produit,
            nom: produit.nom,
            prix: parseFloat(produit.prix),
            img1: produit.img1 || null,
          }],
        });
      } else {
        const exists = fav.produits.some(p => p.id_produit === id_produit);
        if (exists) return res.status(409).json({ message: "Déjà dans les favoris." });
        fav.produits.push({
          id_produit: produit.id_produit,
          nom: produit.nom,
          prix: parseFloat(produit.prix),
          img1: produit.img1 || null,
        });
        fav.date_modification = new Date();
        fav.markModified("produits");
      }

      await fav.save();
      res.json(fav);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // DELETE /api/favoris/remove/:id
  async removeFavori(req, res) {
    try {
      const id_produit = parseInt(req.params.id);
      const fav = await Favoris.findOne({ utilisateur_id: req.user.id });
      if (!fav) return res.json({ utilisateur_id: req.user.id, produits: [] });

      fav.produits = fav.produits.filter(p => p.id_produit !== id_produit);
      fav.date_modification = new Date();
      fav.markModified("produits");
      await fav.save();
      res.json(fav);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new FavorisController();
