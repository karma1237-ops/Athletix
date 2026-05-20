import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { favorisService } from "../services/favorisService";
import { useAuth } from "./AuthContext";

const FavorisContext = createContext(null);

export function FavorisProvider({ children }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) { setItems([]); return; }
    const fetchFavoris = async () => {
      setLoading(true);
      try {
        const fav = await favorisService.getFavoris(accessToken);
        setItems(fav?.produits || []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    fetchFavoris();
  }, [isAuthenticated, accessToken]);

  const addFavori = useCallback(async (id_produit) => {
    const updated = await favorisService.addFavori(accessToken, id_produit);
    setItems(updated.produits || []);
  }, [accessToken]);

  const removeFavori = useCallback(async (id_produit) => {
    const updated = await favorisService.removeFavori(accessToken, id_produit);
    setItems(updated.produits || []);
  }, [accessToken]);

  const isFavori = useCallback((id_produit) => {
    return items.some(p => p.id_produit === id_produit);
  }, [items]);

  return (
    <FavorisContext.Provider value={{ items, loading, addFavori, removeFavori, isFavori, total: items.length }}>
      {children}
    </FavorisContext.Provider>
  );
}

export function useFavoris() {
  const ctx = useContext(FavorisContext);
  if (!ctx) throw new Error("useFavoris doit être utilisé dans FavorisProvider");
  return ctx;
}
