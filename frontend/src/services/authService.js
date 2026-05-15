const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const authService = {
  async register({ nom, prenom, email, password }) {
    const res  = await fetch(`${API}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nom, prenom, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur inscription");
    return data;
  },

  async login(email, password) {
    const res  = await fetch(`${API}/auth/login`, {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      // Construire une erreur enrichie avec waitSeconds et attemptsLeft
      const err       = new Error(data.message || "Erreur connexion");
      err.status      = res.status;
      err.waitSeconds  = data.waitSeconds  ?? 0;
      err.lockedUntil  = data.lockedUntil  ?? null;
      err.attemptsLeft = data.attemptsLeft ?? null;
      throw err;
    }
    return data; // { accessToken, user }
  },

  async refresh() {
    const res = await fetch(`${API}/auth/refresh`, {
      method:      "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json(); // { accessToken, user }
  },

  async logout(accessToken) {
    await fetch(`${API}/auth/logout`, {
      method:      "POST",
      credentials: "include",
      headers:     { Authorization: `Bearer ${accessToken}` },
    });
  },
};
