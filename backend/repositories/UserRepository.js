const { Utilisateur } = require("../models/mysql/Utilisateur");
const { RefreshToken } = require("../models/mysql/RefreshToken");

class UserRepository {
  async findByEmail(email) {
    return Utilisateur.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id) {
    return Utilisateur.findByPk(id, {
      attributes: { exclude: ["mot_de_passe"] },
    });
  }

  async create({ nom, prenom, email, mot_de_passe }) {
    return Utilisateur.create({
      nom:          nom.trim(),
      prenom:       prenom.trim(),
      email:        email.toLowerCase().trim(),
      mot_de_passe,
      role:         "client",
    });
  }

  // ── Refresh Token dans table dédiée ───────────────────────────────────────
  async saveRefreshToken(utilisateur_id, token_hash, expiry) {
    // Révocation de l'ancien token (mise à jour RevokedAt) avant d'en créer un nouveau
    await RefreshToken.update(
      { RevokedAt: new Date() },
      { where: { utilisateur_id, RevokedAt: null } }
    );
    return RefreshToken.create({
      utilisateur_id,
      token_hash,
      expiry,
      CreatedAt: new Date(),
      RevokedAt: null,
    });
  }

  async findRefreshTokensByUser(utilisateur_id) {
    return RefreshToken.findAll({
      where: { utilisateur_id },
    });
  }

  async revokeRefreshToken(utilisateur_id) {
    // On marque le token comme révoqué (RevokedAt) sans le supprimer (traçabilité)
    return RefreshToken.update(
      { RevokedAt: new Date() },
      { where: { utilisateur_id, RevokedAt: null } }
    );
  }

  async update(id, data) {
    const [rows] = await Utilisateur.update(data, { where: { id_utilisateur: id } });
    return rows > 0;
  }

  async findAll() {
    return Utilisateur.findAll({
      attributes: { exclude: ["mot_de_passe"] },
    });
  }

  async delete(id) {
    return Utilisateur.destroy({ where: { id_utilisateur: id } });
  }
}

module.exports = new UserRepository();
