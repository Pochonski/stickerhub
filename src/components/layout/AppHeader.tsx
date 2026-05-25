"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppNav } from "./AppNav";
import { useUser } from "@/hooks/useUser";
import { Trophy, User, LogIn, Coins } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";

export function AppHeader() {
  const { user, loading } = useUser();
  const [coins, setCoins] = useState(0);
  const [packs, setPacks] = useState(0);

  // Fetch initial + subscribe to realtime
  useEffect(() => {
    if (!user) return;
    const sb = getSupabase();

    // Initial fetch
    sb.from("user_packs").select("coins, quantity").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setCoins(data.coins ?? 0); setPacks(data.quantity ?? 0); }
    });

    // Realtime subscription
    const channel = sb
      .channel(`header-packs:${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_packs", filter: `user_id=eq.${user.id}` },
        (payload) => { const d = payload.new as Record<string, unknown>; setCoins((d.coins as number) ?? 0); setPacks((d.quantity as number) ?? 0); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_packs", filter: `user_id=eq.${user.id}` },
        (payload) => { const d = payload.new as Record<string, unknown>; setCoins((d.coins as number) ?? 0); setPacks((d.quantity as number) ?? 0); })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [user]);

  return (
    <header className="flex items-center justify-between py-3 border-b border-[var(--color-border)] mb-6 md:mb-8 md:py-4">
      <Link href="/" className="flex items-center gap-2 md:gap-2.5 text-[18px] md:text-[22px] font-bold tracking-tight text-[var(--color-fg)] no-underline font-[var(--font-display)] shrink-0">
        <span className="w-7 h-7 md:w-9 md:h-9 grid place-items-center bg-[linear-gradient(135deg,var(--color-accent),oklch(68%_0.16_68))] rounded-lg text-white">
          <Trophy size={16} className="md:size-5" strokeWidth={2} />
        </span>
        Sticker<span className="text-[var(--color-primary)]">Hub</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        <AppNav />
        {!loading && (
          user ? (
            <>
              <Link
                href="/shop"
                className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[11px] md:text-xs font-semibold no-underline"
              >
                <Coins size={12} className="md:size-3.5" />
                {coins.toLocaleString()}
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs md:text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent)]/10"
              >
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--color-accent)] grid place-items-center text-white text-[10px] md:text-[11px] font-bold overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={10} className="md:size-3" />
                  )}
                </div>
                <span className="hidden sm:inline">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[var(--color-accent)] text-white text-xs md:text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <LogIn size={12} className="md:size-3.5" /> Ingresar
            </Link>
          )
        )}
      </div>
    </header>
  );
}
