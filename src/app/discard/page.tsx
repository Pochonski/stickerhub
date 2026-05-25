"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabase/client";
import { ALL_PLAYERS } from "@/data/players";
import { ALL_STADIUM_CARDS, ALL_VENUE_CARDS } from "@/data/cards";
import { TEAMS, TEAM_LIST } from "@/data/teams";
import { coinValue } from "@/hooks/useSupabasePacks";
import { Trash2, Coins, Sparkles, Search } from "lucide-react";

function getCardInfo(id: string): { name: string; gradient: string; sub?: string; type: string; faceUrl?: string; overall?: number; teamId?: string } | null {
  const player = ALL_PLAYERS.find((p) => p.id === id);
  if (player) {
    const team = TEAMS[player.teamId];
    return {
      name: player.name, teamId: player.teamId, type: "Jugador",
      gradient: team ? `linear-gradient(180deg, ${team.color} 0%, ${team.colorDark} 100%)` : "",
      sub: `${player.pos} · #${player.num}`,
      faceUrl: player.faceUrl,
      overall: player.overall ?? 0,
    };
  }
  const stadium = ALL_STADIUM_CARDS.find((c) => c.id === id);
  if (stadium) return { name: stadium.name, gradient: stadium.bg, type: "Estadio" };
  const venue = ALL_VENUE_CARDS.find((c) => c.id === id);
  if (venue) return { name: venue.name, gradient: venue.bg, type: "Sede" };
  return null;
}

export default function DiscardPage() {
  const { state, coins } = useGame();
  const { addToast } = useToast();
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set());
  const [localCoins, setLocalCoins] = useState(coins);
  const [search, setSearch] = useState("");
  const [nationFilter, setNationFilter] = useState("");

  const allDuplicates = state.duplicates.filter((id) => !discardedIds.has(id));
  const duplicates = allDuplicates.filter((id) => {
    const info = getCardInfo(id);
    if (!info) return false;
    if (search && !info.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (nationFilter && info.teamId !== nationFilter) return false;
    return true;
  });
  const totalCoins = duplicates.reduce((sum, id) => {
    const info = getCardInfo(id);
    return sum + (info?.overall ? coinValue(info.overall, id) : 150);
  }, 0);

  const handleDiscard = async (cardId: string) => {
    const info = getCardInfo(cardId);
    if (!info) return;
    const value = info.overall ? coinValue(info.overall, cardId) : 150;
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const { error } = await sb
      .from("user_collections")
      .delete()
      .eq("user_id", user.id)
      .eq("card_id", cardId)
      .eq("is_duplicate", true);

    if (error) { addToast("Error al descartar", "error"); return; }

    const { data: pd } = await sb.from("user_packs").select("coins").eq("user_id", user.id).single();
    const newCoins = (pd?.coins ?? localCoins) + value;
    await sb.from("user_packs").upsert({ user_id: user.id, coins: newCoins, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    setDiscardedIds((prev) => new Set(prev).add(cardId));
    setLocalCoins(newCoins);
    addToast(`+${value} 🪙`, "success");
  };

  const handleDiscardAll = async () => {
    if (duplicates.length === 0) return;
    for (const id of duplicates) {
      await handleDiscard(id);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-1">Descartes</h1>
          <p className="text-[var(--color-muted)] text-[15px]">Descartá tus stickers repetidas por monedas.</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6 max-sm:flex-wrap max-sm:w-full">
          <div className="text-right">
            <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Valor total</div>
            <div className="flex items-center gap-1.5 justify-end">
              <Coins size={18} className="text-[var(--color-accent)]" />
              <span className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-accent)]">{totalCoins.toLocaleString()}</span>
            </div>
          </div>
          {duplicates.length > 0 && (
            <button
              onClick={handleDiscardAll}
              className="px-5 py-2.5 rounded-full bg-[var(--color-danger)] text-white text-sm font-semibold cursor-pointer border-none flex items-center gap-2 transition-colors hover:opacity-90 shrink-0"
            >
              <Trash2 size={16} /> Descartar todos (+{totalCoins.toLocaleString()} 🪙)
            </button>
          )}
        </div>
      </div>

      {allDuplicates.length > 0 && (
        <div className="flex items-center gap-3 mb-5 max-sm:flex-col max-sm:items-stretch">
          <div className="relative flex-1 max-w-[300px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text" placeholder="Buscar por nombre..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <select
            value={nationFilter}
            onChange={(e) => setNationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] cursor-pointer outline-none focus:border-[var(--color-accent)]"
          >
            <option value="">Todas las naciones</option>
            {TEAM_LIST.map((t) => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
          <span className="text-xs text-[var(--color-muted)]">{duplicates.length} de {allDuplicates.length}</span>
        </div>
      )}

      {duplicates.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles size={40} className="mx-auto mb-4 text-[var(--color-accent)]/30" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2 font-[var(--font-display)]">Sin stickers repetidas</h3>
          <p className="text-sm text-[var(--color-muted)] max-w-[360px] mx-auto">Abrí sobres para conseguir repetidas. Las repetidas se pueden descartar por monedas o intercambiar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
          {duplicates.map((id) => {
            const info = getCardInfo(id);
            if (!info) return null;
            const value = info.overall ? coinValue(info.overall, id) : 150;
            const isStar = info.overall && coinValue(info.overall, id) >= 1300;
            return (
              <div key={id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] relative">
                  <div className="w-full h-[60%] flex items-center justify-center relative" style={{ background: `${info.gradient || "oklch(72% 0.1 250)"}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                    {info.faceUrl ? (
                      <img src={info.faceUrl} alt={info.name} className="w-[65%] h-[70%] object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl font-extrabold text-white/20">{info.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="h-[40%] bg-white/90 p-3 flex flex-col justify-center text-center border-t border-[var(--color-border)]/30">
                    <span className="text-sm font-bold leading-tight">{info.name}</span>
                    {info.sub && <span className="text-[10px] text-[var(--color-muted)] mt-0.5">{info.sub}</span>}
                  </div>
                </div>
                <div className="p-3 pt-0">
                  <button
                    onClick={() => handleDiscard(id)}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold cursor-pointer border-none transition-colors ${
                      isStar ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20"
                    }`}
                  >
                    <Trash2 size={12} />
                    Descartar +{value} 🪙
                    {isStar && <span className="text-[10px]">⭐</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
