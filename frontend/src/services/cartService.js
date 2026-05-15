const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const h = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const cartService = {
  async getCart(token) {
    const res = await fetch(`${API}/cart`, { headers: h(token), credentials: "include" });
    if (!res.ok) throw new Error("Erreur chargement panier");
    return res.json();
  },
  async addItem(token, produit, quantite) {
    const res = await fetch(`${API}/cart/add`, {
      method: "POST", headers: h(token), credentials: "include",
      body: JSON.stringify({ id_produit: produit.id_produit, quantite }),
    });
    if (!res.ok) throw new Error("Erreur ajout panier");
    return res.json();
  },
  async removeItem(token, id_produit) {
    const res = await fetch(`${API}/cart/remove/${id_produit}`, {
      method: "DELETE", headers: h(token), credentials: "include",
    });
    if (!res.ok) throw new Error("Erreur suppression panier");
    return res.json();
  },
  async clearCart(token) {
    await fetch(`${API}/cart`, { method: "DELETE", headers: h(token), credentials: "include" });
  },
};
