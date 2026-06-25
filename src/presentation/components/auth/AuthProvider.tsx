"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();

    // Use onAuthStateChange to get initial session - fires synchronously
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/album` },
    });
    if (error) throw error;
  };

  const signInWithPassword = async (email: string, password: string) => {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    const sb = getSupabase();
    await sb.auth.signOut();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signInWithPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
