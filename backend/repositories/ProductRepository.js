const { Produit, Categorie } = require("../models/mysql/index");

class ProductRepository {
  async getAll() {
    return Produit.findAll({
      include: [{ model: Categorie, as: "categorie", attributes: ["id_categorie", "nom_categorie"] }],
      order: [["nom", "ASC"]],
    });
  }

  async getById(id) {
    return Produit.findByPk(id, {
      include: [{ model: Categorie, as: "categorie", attributes: ["id_categorie", "nom_categorie"] }],
    });
  }

  async getCategories() {
    return Categorie.findAll({ order: [["nom_categorie", "ASC"]] });
  }
}

module.exports = new ProductRepository();
