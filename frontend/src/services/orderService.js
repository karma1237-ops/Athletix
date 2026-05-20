const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const h = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const orderService = {
  async checkout(token, payload) {
    const res = await fetch(`${API}/orders/checkout`, {
      method: "POST", headers: h(token), credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.message || "Erreur paiement"), { code: data.code });
    return data;
  },
  async getMyOrders(token) {
    const res = await fetch(`${API}/orders/my`, { headers: h(token), credentials: "include" });
    if (!res.ok) throw new Error("Erreur récupération commandes");
    return res.json();
  },
};
