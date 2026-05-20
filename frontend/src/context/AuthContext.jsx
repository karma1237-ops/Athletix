import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000; // refresh à 14 min (access token = 15 min)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading]         = useState(true);
  const refreshTimerRef               = useRef(null);

  const _clearSession = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);
    setAccessToken(null);
  }, []);

  const scheduleTokenRefresh = useCallback((currentToken) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const result = await authService.refresh();
        if (result?.accessToken) {
          setAccessToken(result.accessToken);
          if (result.user) setUser(result.user);
          scheduleTokenRefresh(result.accessToken);
        } else {
          _clearSession();
        }
      } catch {
        _clearSession();
      }
    }, ACCESS_TOKEN_LIFETIME_MS);
  }, [_clearSession]);

  // Refresh silencieux au chargement de la page (si cookie présent)
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const result = await authService.refresh();
        if (result?.accessToken) {
          setAccessToken(result.accessToken);
          setUser(result.user);
          scheduleTokenRefresh(result.accessToken);
        }
      } catch {
        // Pas de session active — état normal
      } finally {
        setLoading(false);
      }
    };
    silentRefresh();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [scheduleTokenRefresh]);

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    setAccessToken(result.accessToken);
    setUser(result.user);
    scheduleTokenRefresh(result.accessToken);
    return result.user;
  }, [scheduleTokenRefresh]);

  const register = useCallback(async (data) => {
    return authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(accessToken); } finally { _clearSession(); }
  }, [accessToken, _clearSession]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      isAuthenticated: !!accessToken && !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
