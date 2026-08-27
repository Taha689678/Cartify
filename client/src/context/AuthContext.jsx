import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      // Don't set error on initial auth check - this is expected for unauthenticated users
      if (error.response && error.response.status !== 401) {
        setError(error.response?.data?.message || "Authentication check failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data.user;
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
      setUser(response.data.user);
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
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
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
