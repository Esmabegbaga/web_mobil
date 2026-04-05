import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "club_official" | "admin";
  studentId?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  clubId?: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (user: AuthUser, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  async function loadAuth() {
    try {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem("campus_token"),
        AsyncStorage.getItem("campus_user"),
      ]);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(newUser: AuthUser, newToken: string) {
    setUser(newUser);
    setToken(newToken);
    await Promise.all([
      AsyncStorage.setItem("campus_token", newToken),
      AsyncStorage.setItem("campus_user", JSON.stringify(newUser)),
    ]);
  }

  async function signOut() {
    setUser(null);
    setToken(null);
    await Promise.all([
      AsyncStorage.removeItem("campus_token"),
      AsyncStorage.removeItem("campus_user"),
    ]);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
