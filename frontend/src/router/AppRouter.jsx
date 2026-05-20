import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider }    from "../context/AuthContext";
import { CartProvider }    from "../context/CartContext";
import { FavorisProvider } from "../context/FavorisContext";
import { ProtectedRoute, AdminRoute } from "../components/common/ProtectedRoute";
import Layout from "../components/layout/Layout";

// Pages auth
import Connexion   from "../pages/auth/Connexion";
import Inscription from "../pages/auth/Inscription";

// Pages client
import Accueil       from "../pages/client/Accueil";
import Catalogue     from "../pages/client/Catalogue";
import DetailProduit from "../pages/client/DetailProduit";
import Panier        from "../pages/client/Panier";
import Favoris       from "../pages/client/Favoris";
import Checkout      from "../pages/client/Checkout";
import Profil        from "../pages/client/espace-client/Profil";
import Historique    from "../pages/client/espace-client/Historique";

// Pages admin
import Dashboard           from "../pages/admin/Dashboard";
import GestionProduits     from "../pages/admin/GestionProduits";
import GestionUtilisateurs from "../pages/admin/GestionUtilisateurs";
import GestionCommandes    from "../pages/admin/GestionCommandes";
import GestionLogs         from "../pages/admin/GestionLogs";

function PublicLayout() {
  return <Layout><Outlet /></Layout>;
}
function AuthLayout() {
  return <Layout noFooter><Outlet /></Layout>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavorisProvider>
            <Routes>
              {/* Pages publiques */}
              <Route element={<PublicLayout />}>
                <Route path="/"            element={<Accueil />} />
                <Route path="/catalogue"   element={<Catalogue />} />
                <Route path="/produit/:id" element={<DetailProduit />} />

                {/* Protégées client */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/panier"     element={<Panier />} />
                  <Route path="/favoris"    element={<Favoris />} />
                  <Route path="/commande"   element={<Checkout />} />
                  <Route path="/profil"     element={<Profil />} />
                  <Route path="/historique" element={<Historique />} />
                </Route>
              </Route>

              {/* Pages auth */}
              <Route element={<AuthLayout />}>
                <Route path="/connexion"   element={<Connexion />} />
                <Route path="/inscription" element={<Inscription />} />
              </Route>

              {/* Pages admin */}
              <Route element={<AdminRoute />}>
                <Route path="/admin"                element={<Dashboard />} />
                <Route path="/admin/produits"       element={<GestionProduits />} />
                <Route path="/admin/utilisateurs"   element={<GestionUtilisateurs />} />
                <Route path="/admin/commandes"      element={<GestionCommandes />} />
                <Route path="/admin/logs"           element={<GestionLogs />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FavorisProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
