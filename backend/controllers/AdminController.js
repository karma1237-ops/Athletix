const { Utilisateur }   = require("../models/mysql/Utilisateur");
const { Produit, Categorie, Commande, LigneCommande } = require("../models/mysql/index");
const argon2 = require("argon2");

class AdminController {

  // ══════════════════════════════════════════════
  // STATS DASHBOARD
  // ══════════════════════════════════════════════
  async getStats(req, res) {
    try {
      const [nbUsers, nbProduits, nbCommandes, revenus] = await Promise.all([
        Utilisateur.count(),
        Produit.count(),
        Commande.count(),
        Commande.sum("montant_hors_taxe_commande"),
      ]);
      res.json({ nbUsers, nbProduits, nbCommandes, revenus: revenus || 0 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // ══════════════════════════════════════════════
  // UTILISATEURS
  // ══════════════════════════════════════════════
  async getUtilisateurs(req, res) {
    try {
      const users = await Utilisateur.findAll({
        attributes: ["id_utilisateur", "nom", "prenom", "email", "role", "date_inscription"],
        order: [["id_utilisateur", "DESC"]],
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async createUtilisateur(req, res) {
    try {
      const { nom, prenom, email, password, role } = req.body;
      if (!nom || !prenom || !email || !password)
        return res.status(400).json({ message: "Tous les champs sont requis." });

      const existe = await Utilisateur.findOne({ where: { email } });
      if (existe) return res.status(409).json({ message: "Email déjà utilisé." });

      const mot_de_passe = await argon2.hash(password);
      const user = await Utilisateur.create({ nom, prenom, email, mot_de_passe, role: role || "client" });
      res.status(201).json({
        id_utilisateur: user.id_utilisateur, nom: user.nom,
        prenom: user.prenom, email: user.email, role: user.role,
        date_inscription: user.date_inscription,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateUtilisateur(req, res) {
    try {
      const { id } = req.params;
      const { nom, prenom, email, role, password } = req.body;
      const user = await Utilisateur.findByPk(id);
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

      const updates = {};
      if (nom)    updates.nom    = nom;
      if (prenom) updates.prenom = prenom;
      if (email)  updates.email  = email;
      if (role)   updates.role   = role;
      if (password) updates.mot_de_passe = await argon2.hash(password);

      await user.update(updates);
      res.json({ message: "Utilisateur mis à jour." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteUtilisateur(req, res) {
    try {
      const { id } = req.params;
      // Empêcher l'admin de se supprimer lui-même
      if (parseInt(id) === req.user.id)
        return res.status(400).json({ message: "Impossible de supprimer votre propre compte." });

      const user = await Utilisateur.findByPk(id);
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

      // ── Révoquer TOUS les refresh tokens avant suppression ────────────────
      // Sans ça, un token existant resterait valide jusqu'à expiration naturelle
      const { RefreshToken } = require("../models/mysql/RefreshToken");
      await RefreshToken.update(
        { RevokedAt: new Date() },
        { where: { utilisateur_id: id, RevokedAt: null } }
      );

      // ── Nettoyer les données MongoDB liées à l'utilisateur ────────────────
      const { Panier, Favoris } = require("../models/mongo");
      await Promise.all([
        Panier.deleteOne({ utilisateur_id: parseInt(id) }),
        Favoris.deleteOne({ utilisateur_id: parseInt(id) }),
      ]);

      // ── Supprimer l'utilisateur ───────────────────────────────────────────
      await user.destroy();

      res.json({ message: "Utilisateur supprimé et sessions révoquées." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // ══════════════════════════════════════════════
  // PRODUITS
  // ══════════════════════════════════════════════
  async getProduits(req, res) {
    try {
      const produits = await Produit.findAll({
        include: [{ model: Categorie, attributes: ["nom_categorie"] }],
        order: [["id_produit", "DESC"]],
      });
      res.json(produits);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getCategories(req, res) {
    try {
      const cats = await Categorie.findAll({ order: [["nom_categorie", "ASC"]] });
      res.json(cats);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async createProduit(req, res) {
    try {
      const { nom, description, prix, stock, id_categorie, promotions, en_vedette, img1, img2, img3 } = req.body;
      if (!nom || !prix || !id_categorie)
        return res.status(400).json({ message: "nom, prix et id_categorie sont requis." });

      const produit = await Produit.create({
        nom, description, prix, stock: stock || 0,
        id_categorie, promotions: !!promotions, en_vedette: !!en_vedette,
        img1, img2, img3,
      });
      res.status(201).json(produit);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateProduit(req, res) {
    try {
      const { id } = req.params;
      const produit = await Produit.findByPk(id);
      if (!produit) return res.status(404).json({ message: "Produit introuvable." });
      await produit.update(req.body);
      res.json({ message: "Produit mis à jour." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteProduit(req, res) {
    try {
      const { id } = req.params;
      const produit = await Produit.findByPk(id);
      if (!produit) return res.status(404).json({ message: "Produit introuvable." });
      await produit.destroy();
      res.json({ message: "Produit supprimé." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // ══════════════════════════════════════════════
  // COMMANDES
  // ══════════════════════════════════════════════
  async getCommandes(req, res) {
    try {
      const commandes = await Commande.findAll({
        include: [
          { model: LigneCommande, include: [{ model: Produit, attributes: ["nom"] }] },
        ],
        order: [["id_commande", "DESC"]],
      });

      // Enrichir avec le nom du client
      const { sequelize } = require("../config/mysql");
      const ids = commandes.map(c => c.utilisateur_id);
      const users = await Utilisateur.findAll({
        where: { id_utilisateur: ids },
        attributes: ["id_utilisateur", "nom", "prenom", "email"],
      });
      const usersMap = Object.fromEntries(users.map(u => [u.id_utilisateur, u]));

      const result = commandes.map(c => ({
        ...c.toJSON(),
        client: usersMap[c.utilisateur_id] || null,
      }));

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateStatutCommande(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.body;
      const valides = ["en_attente", "validee", "expediee", "livree"];
      if (!valides.includes(statut))
        return res.status(400).json({ message: "Statut invalide." });

      const commande = await Commande.findByPk(id);
      if (!commande) return res.status(404).json({ message: "Commande introuvable." });
      await commande.update({ statut });
      res.json({ message: "Statut mis à jour." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // ══════════════════════════════════════════════
  // CATEGORIES
  // ══════════════════════════════════════════════
  async createCategorie(req, res) {
    try {
      const { nom_categorie, description } = req.body;
      if (!nom_categorie) return res.status(400).json({ message: "nom_categorie requis." });
      const cat = await Categorie.create({ nom_categorie, description });
      res.status(201).json(cat);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteCategorie(req, res) {
    try {
      const { id } = req.params;
      const cat = await Categorie.findByPk(id);
      if (!cat) return res.status(404).json({ message: "Catégorie introuvable." });
      await cat.destroy();
      res.json({ message: "Catégorie supprimée." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new AdminController();