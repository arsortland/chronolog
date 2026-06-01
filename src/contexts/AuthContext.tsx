// Created: 2025-01-28
// v2.0 - Initial creation
// v2.1 - Expose sendPasswordReset through context
// Purpose: React context providing authentication state and helpers to all child components.
//          Exposes useAuth() hook with current user, loading state, signIn, signUp, signOut, sendPasswordReset.

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { signIn, signUp, signOut, sendPasswordReset, subscribeToAuthState } from "../lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleSignIn(email: string, password: string) {
    await signIn(email, password);
  }

  async function handleSignUp(
    email: string,
    password: string,
    displayName: string,
  ) {
    await signUp(email, password, displayName);
  }

  async function handleSignOut() {
    await signOut();
  }

  async function handleSendPasswordReset(email: string) {
    await sendPasswordReset(email);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        sendPasswordReset: handleSendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
