import { getSupabase } from "@/infrastructure/supabase/client";
import type { AuthRepository, AuthSession } from "@/core/application/ports";

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    return {
      user: { id: data.session.user.id, email: data.session.user.email },
      access_token: data.session.access_token,
    };
  }

  async getUser() {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  async signInWithOtp(email: string): Promise<void> {
    const sb = getSupabase();
    await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/album` },
    });
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const sb = getSupabase();
    await sb.auth.signInWithPassword({ email, password });
  }

  async signOut(): Promise<void> {
    const sb = getSupabase();
    await sb.auth.signOut();
  }
}
