/**
 * Tests unitaires — jwtService
 * Couvre : génération et vérification des access/refresh tokens
 */

process.env.JWT_ACCESS_SECRET  = "test_access_secret_32chars_minimum!!";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_32chars_minimum!";
process.env.JWT_ACCESS_EXPIRY  = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

const jwtService = require("../services/jwtService");

const PAYLOAD = { id: 42, role: "client" };

describe("jwtService.generateAccessToken", () => {
  it("génère un token non vide", () => {
    const token = jwtService.generateAccessToken(PAYLOAD);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("le token contient 3 parties séparées par des points (JWT format)", () => {
    const token = jwtService.generateAccessToken(PAYLOAD);
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("jwtService.generateRefreshToken", () => {
  it("génère un refresh token différent de l'access token", () => {
    const access  = jwtService.generateAccessToken(PAYLOAD);
    const refresh = jwtService.generateRefreshToken(PAYLOAD);
    expect(access).not.toBe(refresh);
  });
});

describe("jwtService.verifyAccessToken", () => {
  it("retourne le payload décodé pour un token valide", () => {
    const token   = jwtService.generateAccessToken(PAYLOAD);
    const decoded = jwtService.verifyAccessToken(token);
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe("client");
  });

  it("lève une erreur pour un token invalide", () => {
    expect(() => jwtService.verifyAccessToken("token.invalide.ici")).toThrow();
  });

  it("lève une erreur pour un token vide", () => {
    expect(() => jwtService.verifyAccessToken("")).toThrow();
  });
});

describe("jwtService.verifyRefreshToken", () => {
  it("retourne le payload pour un refresh token valide", () => {
    const token   = jwtService.generateRefreshToken(PAYLOAD);
    const decoded = jwtService.verifyRefreshToken(token);
    expect(decoded.id).toBe(42);
  });

  it("lève une erreur si on vérifie un access token avec verifyRefreshToken", () => {
    const accessToken = jwtService.generateAccessToken(PAYLOAD);
    expect(() => jwtService.verifyRefreshToken(accessToken)).toThrow();
  });
});
