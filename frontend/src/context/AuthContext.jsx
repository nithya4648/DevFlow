import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/auth.service";
import { retryRequest, retryConfig } from "../utils/retryConfig";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      // Use the same retry helper as LoginPage so a Render cold-start doesn't
      // leave the app stuck on the loading screen with a user who is logged in.
      const data = await retryRequest(() => authService.getMe(), {
        ...retryConfig,
        maxAttempts: 3,
      });
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
