"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { PACK_BUNDLES, coinValue } from "@/hooks/useSupabasePacks";
import { PackageOpen, Coins, Sparkles } from "lucide-react";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export default function ShopPage() {
  const { coins } = useGame();
  const { addToast } = useToast();
  const [buying, setBuying] = useState(false);

  const handleBuy = async (bundle: typeof PACK_BUNDLES[0]) => {
    if (coins < bundle.price) return;
    setBuying(true);
    try {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { addToast("Iniciá sesión para comprar", "error"); return; }

      // Get current state
      const { data: packData, error: fetchError } = await sb
        .from("user_packs")
        .select("coins, quantity")
        .eq("user_id", user.id)
        .single();

      if (fetchError || !packData) { addToast("Error al comprar", "error"); return; }
      if (packData.coins < bundle.price) { addToast("Monedas insuficientes", "error"); return; }

      const newCoins = packData.coins - bundle.price;
      const newQty = (packData.quantity ?? 0) + bundle.quantity;

      const { error } = await sb
        .from("user_packs")
        .upsert(
          { user_id: user.id, quantity: newQty, coins: newCoins, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (error) { addToast("Error al comprar", "error"); return; }

      addToast(`¡${bundle.label} comprado! ${bundle.savings ? `(${bundle.savings})` : ""}`, "success");
    } catch {
      addToast("Error al comprar", "error");
    }
    setBuying(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-1">Tienda de Sobres</h1>
          <p className="text-[var(--color-muted)] text-[15px]">Comprá sobres con monedas. Ganá monedas descartando repetidas.</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-full px-5 py-2.5">
          <Coins size={20} className="text-[var(--color-accent)]" />
          <span className="font-[var(--font-display)] text-xl font-bold text-[var(--color-accent)]">{coins.toLocaleString()}</span>
          <span className="text-sm text-[var(--color-muted)]">monedas</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {PACK_BUNDLES.map((bundle) => (
          <div
            key={bundle.quantity}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-accent-soft)] grid place-items-center">
              <PackageOpen size={28} className="text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <h3 className="font-[var(--font-display)] text-xl font-bold mb-1">{bundle.label}</h3>
            <p className="text-sm text-[var(--color-muted)] mb-1">{bundle.quantity * 6} stickers</p>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Coins size={16} className="text-[var(--color-accent)]" />
              <span className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-accent)]">{bundle.price.toLocaleString()}</span>
            </div>
            {bundle.savings && (
              <span className="inline-block text-[11px] font-semibold text-[var(--color-success)] bg-[oklch(94%_0.06_156)] px-2 py-0.5 rounded-full mb-3">
                {bundle.savings} 🪙
              </span>
            )}
            <button
              onClick={() => handleBuy(bundle)}
              disabled={buying || coins < bundle.price}
              className="w-full px-5 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {coins < bundle.price ? `Te faltan ${(bundle.price - coins).toLocaleString()} 🪙` : "Comprar"}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
        <h2 className="font-[var(--font-display)] text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-[var(--color-accent)]" /> Cómo ganar monedas
        </h2>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 text-sm">
          <div className="bg-[var(--color-bg)]/70 rounded-xl p-4">
            <h3 className="font-semibold mb-2">🗑️ Descartar repetidas</h3>
            <table className="w-full text-xs text-[var(--color-muted)]">
              <tbody>
                <tr><td className="py-1">Rating 90+</td><td className="text-right font-bold text-[var(--color-accent)]">900 🪙</td></tr>
                <tr><td className="py-1">Rating 85-89</td><td className="text-right font-bold text-[var(--color-accent)]">700 🪙</td></tr>
                <tr><td className="py-1">Rating 80-84</td><td className="text-right font-bold text-[var(--color-accent)]">500 🪙</td></tr>
                <tr><td className="py-1">Rating 75-79</td><td className="text-right font-bold text-[var(--color-accent)]">300 🪙</td></tr>
                <tr><td className="py-1">Rating &lt;75</td><td className="text-right font-bold text-[var(--color-accent)]">150 🪙</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-[var(--color-bg)]/70 rounded-xl p-4">
            <h3 className="font-semibold mb-2">🏆 Completar equipos</h3>
            <p className="text-xs text-[var(--color-muted)] mb-3">Al completar los 20 stickers de una selección:</p>
            <span className="font-[var(--font-display)] text-lg font-bold text-[var(--color-success)]">+500 🪙</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
