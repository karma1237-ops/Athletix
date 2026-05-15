const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Helper qui injecte le token et gère les erreurs
async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${API}/admin${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur serveur");
  return data;
}

export const adminService = {
  // ── Dashboard ───────────────────────────────────────────────────────────────
  getStats: (token) => apiFetch("/stats", token),

  // ── Utilisateurs ────────────────────────────────────────────────────────────
  getUtilisateurs: (token) => apiFetch("/utilisateurs", token),
  createUtilisateur: (token, body) =>
    apiFetch("/utilisateurs", token, { method: "POST", body: JSON.stringify(body) }),
  updateUtilisateur: (token, id, body) =>
    apiFetch(`/utilisateurs/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteUtilisateur: (token, id) =>
    apiFetch(`/utilisateurs/${id}`, token, { method: "DELETE" }),

  // ── Produits ────────────────────────────────────────────────────────────────
  getProduits: (token) => apiFetch("/produits", token),
  createProduit: (token, body) =>
    apiFetch("/produits", token, { method: "POST", body: JSON.stringify(body) }),
  updateProduit: (token, id, body) =>
    apiFetch(`/produits/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduit: (token, id) =>
    apiFetch(`/produits/${id}`, token, { method: "DELETE" }),

  // ── Catégories ───────────────────────────────────────────────────────────────
  getCategories: (token) => apiFetch("/categories", token),
  createCategorie: (token, body) =>
    apiFetch("/categories", token, { method: "POST", body: JSON.stringify(body) }),
  deleteCategorie: (token, id) =>
    apiFetch(`/categories/${id}`, token, { method: "DELETE" }),

  // ── Commandes ────────────────────────────────────────────────────────────────
  getCommandes: (token) => apiFetch("/commandes", token),
  updateStatutCommande: (token, id, statut) =>
    apiFetch(`/commandes/${id}/statut`, token, { method: "PATCH", body: JSON.stringify({ statut }) }),
};

// ── Logs ────────────────────────────────────────────────────────────────────
// (appels directs dans GestionLogs pour la pagination)
