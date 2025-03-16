"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import API from "./api";

interface AuthContextType {
  user: { id: number; email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    API.get("/me")
      .then((res: any) => setUser(res.data.user))
      .catch(() => {
        setUser(null);

        if (window.location.pathname === "/signin") return;

        router.push("/login");
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await API.post("/login", { email, password });

      setUser(res.data.user);

      router.push("/");
    } catch (err: any) {
      if (err.response?.data?.error) throw new Error(err.response?.data?.error);
      else console.error(err);
    }
  };

  const logout = async () => {
    try {
      await API.post("/logout");
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
};
