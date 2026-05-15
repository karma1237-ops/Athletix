const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const h = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const favorisService = {
  async getFavoris(token) {
    const res = await fetch(`${API}/favoris`, { headers: h(token), credentials: "include" });
    if (!res.ok) throw new Error("Erreur chargement favoris");
    return res.json();
  },
  async addFavori(token, id_produit) {
    const res = await fetch(`${API}/favoris/add`, {
      method: "POST", headers: h(token), credentials: "include",
      body: JSON.stringify({ id_produit }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur ajout favori");
    return data;
  },
  async removeFavori(token, id_produit) {
    const res = await fetch(`${API}/favoris/remove/${id_produit}`, {
      method: "DELETE", headers: h(token), credentials: "include",
    });
    if (!res.ok) throw new Error("Erreur suppression favori");
    return res.json();
  },
};
