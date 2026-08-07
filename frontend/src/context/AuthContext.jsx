import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/auth.service";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      // Suppress console log for non-logged in state to keep terminal logs clean
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('devflow_token', token);
    // Remove token param from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  checkAuth();
}, [checkAuth]);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
