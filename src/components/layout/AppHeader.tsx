"use client";

import Link from "next/link";
import { AppNav } from "./AppNav";
import { useUser } from "@/hooks/useUser";
import { Trophy, User, LogIn } from "lucide-react";

export function AppHeader() {
  const { user, loading } = useUser();

  return (
    <header className="flex items-center justify-between py-4 border-b border-[var(--color-border)] mb-8">
      <Link href="/" className="flex items-center gap-2.5 text-[22px] font-bold tracking-tight text-[var(--color-fg)] no-underline font-[var(--font-display)]">
        <span className="w-9 h-9 grid place-items-center bg-[linear-gradient(135deg,var(--color-accent),oklch(68%_0.16_68))] rounded-lg text-white">
          <Trophy size={20} strokeWidth={2} />
        </span>
        Álbum Virtual
      </Link>

      <div className="flex items-center gap-4">
        <AppNav />
        {!loading && (
          user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent)]/10"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] grid place-items-center text-white text-[11px] font-bold overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={12} />
                )}
              </div>
              {user.user_metadata?.full_name || user.email?.split("@")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <LogIn size={14} /> Ingresar
            </Link>
          )
        )}
      </div>
    </header>
  );
}
