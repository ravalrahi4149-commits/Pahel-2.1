import React, { createContext, useContext, useState, useEffect } from "react";
import { api, UserProfile } from "./api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; organization?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginAsDemo: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cracklife_token");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      setUser(res.user);
    } catch (err) {
      // If unauthorized, clear token
      console.warn("Could not load user profile with current token.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("cracklife_token", res.token);
  };

  const loginAsDemo = async () => {
    try {
      await login("demo@cracklife.ai", "CrackLife2026!");
    } catch (err) {
      // Fallback demo user simulation if backend is offline
      const demoUser: UserProfile = {
        id: 1,
        email: "demo@cracklife.ai",
        fullName: "Dr. Elena Vance, P.E.",
        role: "lead_inspector",
        organization: "Apex Structural Health Diagnostic Lab",
        languagePreference: "en",
        themePreference: "dark",
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setToken("demo_token_2026");
      localStorage.setItem("cracklife_token", "demo_token_2026");
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; organization?: string }) => {
    const res = await api.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("cracklife_token", res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cracklife_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user || !!token,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
