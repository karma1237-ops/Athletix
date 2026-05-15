import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#111" }}>
    <div style={{ width:36, height:36, border:"3px solid rgba(255,102,0,0.2)", borderTop:"3px solid #ff6600", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
  </div>
);

// ── Client connecté ───────────────────────────────────────────────────────────
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/connexion" replace />;
}

// ── Admin uniquement ──────────────────────────────────────────────────────────
export function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
