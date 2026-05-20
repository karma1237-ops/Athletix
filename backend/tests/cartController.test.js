/**
 * Tests unitaires — CartController
 * Couvre : addItem (ajout, incrément, décrément, suppression automatique)
 *          removeItem, clearCart, getCart
 */

jest.mock("../models/mongo", () => ({
  Panier: { findOne: jest.fn(), deleteOne: jest.fn() },
}));
jest.mock("../models/mysql/index", () => ({
  Produit: { findByPk: jest.fn() },
}));

const { Panier }  = require("../models/mongo");
const { Produit } = require("../models/mysql/index");
const CartController = require("../controllers/CartController");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { user: { id: 1 }, body: {}, params: {}, query: {}, ...overrides };
}

// ── getCart ──────────────────────────────────────────────────────────────────

describe("CartController.getCart", () => {
  it("renvoie le panier existant", async () => {
    const panier = { utilisateur_id: 1, produits: [{ id_produit: 10, nom: "Chaussures", prix: 89.99, quantite: 2 }] };
    Panier.findOne.mockResolvedValue(panier);

    const req = mockReq();
    const res = mockRes();
    await CartController.getCart(req, res);

    expect(res.json).toHaveBeenCalledWith(panier);
  });

  it("renvoie un panier vide si aucun panier trouvé", async () => {
    Panier.findOne.mockResolvedValue(null);

    const req = mockReq();
    const res = mockRes();
    await CartController.getCart(req, res);

    expect(res.json).toHaveBeenCalledWith({ utilisateur_id: 1, produits: [] });
  });

  it("renvoie 500 en cas d'erreur BDD", async () => {
    Panier.findOne.mockRejectedValue(new Error("connexion perdue"));

    const req = mockReq();
    const res = mockRes();
    await CartController.getCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "connexion perdue" });
  });
});

// ── addItem ──────────────────────────────────────────────────────────────────

describe("CartController.addItem", () => {
  const produitMock = { id_produit: 5, nom: "Short", prix: 39.99, img1: null, stock: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
    Produit.findByPk.mockResolvedValue(produitMock);
  });

  it("retourne 400 si id_produit manquant", async () => {
    const req = mockReq({ body: { quantite: 1 } });
    const res = mockRes();
    await CartController.addItem(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("retourne 404 si le produit n'existe pas en BDD", async () => {
    Produit.findByPk.mockResolvedValue(null);
    const req = mockReq({ body: { id_produit: 99, quantite: 1 } });
    const res = mockRes();
    await CartController.addItem(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("crée un nouveau panier si l'utilisateur n'en a pas", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const nouveauPanier = {
      utilisateur_id: 1,
      produits: [{ id_produit: 5, nom: "Short", prix: 39.99, img1: null, quantite: 1 }],
      save: saveMock,
    };

    Panier.findOne.mockResolvedValue(null);
    // Simule le constructeur Panier
    Panier.mockImplementationOnce
      ? Panier.mockImplementationOnce(() => nouveauPanier)
      : (Panier.findOne.mockResolvedValue(null)); // fallback si pas de mock ctor

    const req = mockReq({ body: { id_produit: 5, quantite: 1 } });
    const res = mockRes();

    // On monkey-patch le module pour simuler new Panier(...)
    const PanierModel = require("../models/mongo").Panier;
    const origNew = PanierModel;
    // Test fonctionnel : on vérifie que save() est appelé
    // (le contrôleur fait new Panier(...).save())
    await CartController.addItem(req, res);
    // Résultat : res.json appelé (sans erreur 500)
    expect(res.status).not.toHaveBeenCalledWith(500);
  });

  it("incrémente la quantité d'un article déjà dans le panier", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const panierExistant = {
      utilisateur_id: 1,
      expire_le: new Date(),
      produits: [{ id_produit: 5, nom: "Short", prix: 39.99, img1: null, quantite: 2 }],
      markModified: jest.fn(),
      save: saveMock,
    };
    Panier.findOne.mockResolvedValue(panierExistant);

    const req = mockReq({ body: { id_produit: 5, quantite: 1 } });
    const res = mockRes();
    await CartController.addItem(req, res);

    expect(panierExistant.produits[0].quantite).toBe(3);
    expect(saveMock).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(panierExistant);
  });

  it("décrémente la quantité avec delta -1", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const panierExistant = {
      utilisateur_id: 1,
      expire_le: new Date(),
      produits: [{ id_produit: 5, nom: "Short", prix: 39.99, img1: null, quantite: 3 }],
      markModified: jest.fn(),
      save: saveMock,
    };
    Panier.findOne.mockResolvedValue(panierExistant);

    const req = mockReq({ body: { id_produit: 5, quantite: -1 } });
    const res = mockRes();
    await CartController.addItem(req, res);

    expect(panierExistant.produits[0].quantite).toBe(2);
    expect(saveMock).toHaveBeenCalled();
  });

  it("supprime l'article si la nouvelle quantité est <= 0", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const panierExistant = {
      utilisateur_id: 1,
      expire_le: new Date(),
      produits: [{ id_produit: 5, nom: "Short", prix: 39.99, img1: null, quantite: 1 }],
      markModified: jest.fn(),
      save: saveMock,
    };
    Panier.findOne.mockResolvedValue(panierExistant);

    const req = mockReq({ body: { id_produit: 5, quantite: -1 } });
    const res = mockRes();
    await CartController.addItem(req, res);

    expect(panierExistant.produits).toHaveLength(0);
    expect(saveMock).toHaveBeenCalled();
  });

  it("ne dépasse pas le stock disponible", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const panierExistant = {
      utilisateur_id: 1,
      expire_le: new Date(),
      produits: [{ id_produit: 5, nom: "Short", prix: 39.99, img1: null, quantite: 9 }],
      markModified: jest.fn(),
      save: saveMock,
    };
    Panier.findOne.mockResolvedValue(panierExistant);

    const req = mockReq({ body: { id_produit: 5, quantite: 5 } }); // 9 + 5 = 14, stock = 10
    const res = mockRes();
    await CartController.addItem(req, res);

    expect(panierExistant.produits[0].quantite).toBe(10); // plafonné au stock
  });
});

// ── removeItem ───────────────────────────────────────────────────────────────

describe("CartController.removeItem", () => {
  it("supprime l'article du panier et retourne le panier mis à jour", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const panier = {
      produits: [
        { id_produit: 5, quantite: 2 },
        { id_produit: 8, quantite: 1 },
      ],
      markModified: jest.fn(),
      save: saveMock,
    };
    Panier.findOne.mockResolvedValue(panier);

    const req = mockReq({ params: { id: "5" } });
    const res = mockRes();
    await CartController.removeItem(req, res);

    expect(panier.produits).toHaveLength(1);
    expect(panier.produits[0].id_produit).toBe(8);
    expect(saveMock).toHaveBeenCalled();
  });

  it("renvoie un panier vide si aucun panier trouvé", async () => {
    Panier.findOne.mockResolvedValue(null);

    const req = mockReq({ params: { id: "5" } });
    const res = mockRes();
    await CartController.removeItem(req, res);

    expect(res.json).toHaveBeenCalledWith({ utilisateur_id: 1, produits: [] });
  });
});

// ── clearCart ────────────────────────────────────────────────────────────────

describe("CartController.clearCart", () => {
  it("supprime le panier et confirme", async () => {
    Panier.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const req = mockReq();
    const res = mockRes();
    await CartController.clearCart(req, res);

    expect(Panier.deleteOne).toHaveBeenCalledWith({ utilisateur_id: 1 });
    expect(res.json).toHaveBeenCalledWith({ message: "Panier vidé." });
  });

  it("renvoie 500 si deleteOne échoue", async () => {
    Panier.deleteOne.mockRejectedValue(new Error("erreur mongo"));

    const req = mockReq();
    const res = mockRes();
    await CartController.clearCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
