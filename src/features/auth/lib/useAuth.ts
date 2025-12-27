"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_USERS, type MockUser } from "@/features/auth/mock/authMock";

const AUTH_STORAGE_KEY = "vietsport_auth";

interface UseAuthReturn {
  user: MockUser | null;
  loading: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as MockUser;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    // Find user in mock data
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!foundUser) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    // Store user in state and localStorage
    setUser(foundUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return {
    user,
    loading,
    login,
    logout,
  };
}

