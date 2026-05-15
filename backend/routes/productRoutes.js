const express = require("express");
const router  = express.Router();
const ProductRepository = require("../repositories/ProductRepository");

router.get("/products", async (req, res) => {
  try {
    const produits    = await ProductRepository.getAll();
    const categories  = await ProductRepository.getCategories();
    res.json({ success: true, produits, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des produits" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const produit = await ProductRepository.getById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, produit });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération du produit" });
  }
});

module.exports = router;
