"use client";

import { useState, useEffect, useCallback } from "react";
import { login, type AuthUser } from "@/lib/api/auth";

const AUTH_STORAGE_KEY = "vietsport_auth";

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      const response = await login({ username, password });

      // Store user data and token
      const userData = response.user;
      const authData = {
        ...userData,
        token: response.access_token,
      };

      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return {
    user,
    loading,
    login: handleLogin,
    logout,
  };
}

