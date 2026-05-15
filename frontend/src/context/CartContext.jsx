import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) { setItems([]); return; }
    const fetchCart = async () => {
      setLoading(true);
      try {
        const cart = await cartService.getCart(accessToken);
        setItems(cart?.produits || []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    fetchCart();
  }, [isAuthenticated, accessToken]);

  const addItem = useCallback(async (produit, quantite = 1) => {
    const updated = await cartService.addItem(accessToken, produit, quantite);
    setItems(updated.produits);
  }, [accessToken]);

  const removeItem = useCallback(async (id_produit) => {
    const updated = await cartService.removeItem(accessToken, id_produit);
    setItems(updated.produits);
  }, [accessToken]);

  const clearCart = useCallback(async () => {
    await cartService.clearCart(accessToken);
    setItems([]);
  }, [accessToken]);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      totalItems: items.reduce((s, i) => s + i.quantite, 0),
      totalPrice: items.reduce((s, i) => s + i.prix * i.quantite, 0),
      addItem,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}
