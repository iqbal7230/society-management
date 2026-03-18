"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLogin, apiGetMe, apiUpdateProfile, ApiUser } from "../lib/api";
import type { User } from "../lib/data";


function toFrontendUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone || "",
    role: apiUser.role,
    flatId: apiUser.flat_id ? String(apiUser.flat_id) : undefined,
  };
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string,) => 
    Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle auth initialization — checks JWT token in localStorage
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("society_token");
      if (token) {
        try {
          const apiUser = await apiGetMe();
          setCurrentUser(toFrontendUser(apiUser));
        } catch {
          // Token invalid/expired
          localStorage.removeItem("society_token");
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await apiLogin(email, password);
      localStorage.setItem("society_token", token);
      const frontendUser = toFrontendUser(user);
      setCurrentUser(frontendUser);
      return { success: true, role: frontendUser.role };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("society_token");
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const apiUpdates: Partial<{
        name: string;
        phone: string;
        password: string;
      }> = {};
      if (updates.name) apiUpdates.name = updates.name;
      if (updates.phone) apiUpdates.phone = updates.phone;
      if (updates.password) apiUpdates.password = updates.password;

      const apiUser = await apiUpdateProfile(apiUpdates);
      setCurrentUser(toFrontendUser(apiUser));
    } catch (err) {
      console.error("Profile update failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, isLoading, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
