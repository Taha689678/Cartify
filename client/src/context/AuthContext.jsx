import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);
const getUserFromResponse = (response) => response.data?.data?.user ?? null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(getUserFromResponse(response));
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error.response && error.response.status !== 401) {
        setError(error.response?.data?.message || "Authentication check failed");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    checkAuth();
  }, [checkAuth]);

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(getUserFromResponse(response));
      setIsAuthenticated(true);
      setError(null);
      return getUserFromResponse(response);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setError(error.response?.data?.message || "Failed to refresh user session");
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      setUser(getUserFromResponse(response));
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      setError(null);
      // Registration does not automatically authenticate the user
      // The user must verify their email first
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);

    try {
      await authApi.logout();
    } catch {
      return;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
