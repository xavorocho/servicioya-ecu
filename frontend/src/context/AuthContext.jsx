import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("sy_token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("sy_user", JSON.stringify(data));
    } catch {
      localStorage.removeItem("sy_token");
      localStorage.removeItem("sy_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("sy_token", data.token);
    localStorage.setItem("sy_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async (credential, options = {}) => {
    const { data } = await api.post("/auth/google", { credential, ...options });
    localStorage.setItem("sy_token", data.token);
    localStorage.setItem("sy_user", JSON.stringify(data.user));
    setUser(data.user);
    return { ...data.user, requiresProviderProfile: data.requiresProviderProfile };
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData, userData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("sy_token");
    localStorage.removeItem("sy_user");
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("sy_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
