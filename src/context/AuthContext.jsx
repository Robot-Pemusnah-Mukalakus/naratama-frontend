"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }
      return {
        success: false,
        message: response.message || "Login failed",
        errors: response.errors || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors || [],
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }
      if (response.errors) {
        return {
          success: "false",
          message: response.message || "Registration failed",
          errors: response.errors,
        };
      }
      return {
        success: "false",
        message: response || "Registration failed",
        errors: response.errors || [],
      };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: error.message,
        errors: error.errors || [],
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const googleLogin = () => {
    // This will redirect the user to Google OAuth page
    authService.googleLogin();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isStaff,
        login,
        register,
        logout,
        googleLogin,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
