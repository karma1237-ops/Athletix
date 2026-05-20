/**
 * Tests unitaires — Middleware validateInput
 * Couvre : champs obligatoires, types, min/max, enum, cartAdd avec delta négatif
 */

const { validate, RULES } = require("../middlewares/validateInput");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe("validateInput — RULES.cartAdd", () => {
  const middleware = validate(RULES.cartAdd);

  it("passe si id_produit et quantite positif sont valides", () => {
    const req  = { body: { id_produit: 3, quantite: 2 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("passe si quantite est négative (décrémentation panier)", () => {
    const req  = { body: { id_produit: 3, quantite: -1 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("bloque si id_produit est absent", () => {
    const req  = { body: { quantite: 1 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("bloque si id_produit vaut 0 (min: 1)", () => {
    const req  = { body: { id_produit: 0, quantite: 1 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("bloque si quantite dépasse 99", () => {
    const req  = { body: { id_produit: 1, quantite: 100 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("bloque si quantite est inférieure à -99", () => {
    const req  = { body: { id_produit: 1, quantite: -100 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateInput — RULES.utilisateur", () => {
  const middleware = validate(RULES.utilisateur);

  it("passe avec des données utilisateur valides", () => {
    const req  = { body: { prenom: "Jean", nom: "Dupont", email: "jean@exemple.fr", mot_de_passe: "Secur1t$", role: "client" } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("bloque si email est absent", () => {
    const req  = { body: { prenom: "Jean", nom: "Dupont", mot_de_passe: "Secur1t$" } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateInput — RULES.produit", () => {
  const middleware = validate(RULES.produit);

  it("passe avec un produit valide", () => {
    const req  = { body: { nom: "Chaussures de course", prix: 89.99, stock: 50 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("bloque si nom est absent", () => {
    const req  = { body: { prix: 89.99, stock: 50 } };
    const res  = mockRes();
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
