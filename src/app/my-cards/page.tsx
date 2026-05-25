"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGame } from "@/context/GameContext";
import { ALL_PLAYERS } from "@/data/players";
import { ALL_STADIUM_CARDS, ALL_VENUE_CARDS } from "@/data/cards";
import { TEAMS, STADIUMS, VENUES } from "@/data/teams";
import type { Player } from "@/data/types";
import { Search, WalletCards, Send, Inbox, Trash2, Coins } from "lucide-react";
import { coinValue } from "@/hooks/useSupabasePacks";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabase/client";

function getCardInfo(id: string): { name: string; gradient: string; sub?: string; type: string; faceUrl?: string; overall?: number } | null {
  const player = ALL_PLAYERS.find((p) => p.id === id);
  if (player) {
    const team = TEAMS[player.teamId];
    return {
      name: player.name,
      gradient: team ? `linear-gradient(180deg, ${team.color} 0%, ${team.colorDark} 100%)` : "linear-gradient(180deg, oklch(72% 0.1 250), oklch(58% 0.12 250))",
      sub: `${player.pos} · #${player.num}`,
      type: "Jugador",
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

export default function MyCardsPage() {
  const { state, isCollected, isDuplicate, coins } = useGame();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");

  const collectedIds = Object.keys(state.collected).filter((id) => isCollected(id));
  const duplicateIds = state.duplicates;
  const totalPlayerCards = ALL_PLAYERS.length;
  const playerCollected = ALL_PLAYERS.filter((p) => isCollected(p.id)).length;
  const totalAll = totalPlayerCards + ALL_STADIUM_CARDS.length + ALL_VENUE_CARDS.length;

const filteredCollected = collectedIds.filter((id) => {
    if (!search) return true;
    const info = getCardInfo(id);
    return info?.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleDiscard = async (cardId: string) => {
    const info = getCardInfo(cardId);
    if (!info) return;
    const value = info.overall ? coinValue(info.overall) : 150;

    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    // Delete the duplicate from collection
    const { error } = await sb
      .from("user_collections")
      .delete()
      .eq("user_id", user.id)
      .eq("card_id", cardId)
      .eq("is_duplicate", true);

    if (error) { addToast("Error al descartar", "error"); return; }

    // Add coins
    const { data: packData } = await sb
      .from("user_packs")
      .select("coins")
      .eq("user_id", user.id)
      .single();

    const newCoins = (packData?.coins ?? 0) + value;
    await sb.from("user_packs").upsert({ user_id: user.id, coins: newCoins, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    addToast(`¡Descartado! +${value} 🪙`, "success");
  };

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Mi Colección</h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-8">Gestiona tus postales: las que ya tienes, las repetidas y las que tienes en intercambio.</p>

      <div className="grid grid-cols-4 gap-5 mb-10 max-sm:grid-cols-2">
        <StatCard num={collectedIds.length} label="Postales obtenidas" />
        <StatCard num={`${totalAll > 0 ? Math.round((collectedIds.length / totalAll) * 100) : 0}%`} label="Completado" />
        <StatCard num={duplicateIds.length} label="Repetidas" />
        <StatCard num={state.trades.filter((t) => t.status === "pending").length} label="En intercambio" />
      </div>

      {/* All cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Todas mis postales</h2>
          <div className="relative max-w-[260px]">
            <label className="sr-only" htmlFor="my-cards-search">Filtrar postales</label>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true">
              <Search size={16} strokeWidth={2} />
            </span>
            <input
              id="my-cards-search"
              type="text"
              placeholder="Filtrar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-fg)] transition-colors focus:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            />
          </div>
        </div>

        {filteredCollected.length === 0 ? (
          <EmptyState
            icon={<WalletCards size={36} strokeWidth={1.5} />}
            title="Sin postales"
            description={search ? "No se encontraron postales con ese filtro." : "Aún no tienes postales. ¡Abre un sobre para comenzar!"}
          />
        ) : (
          <div className="grid grid-cols-6 gap-3 max-lg:grid-cols-4 max-sm:grid-cols-3">
            {filteredCollected.map((id) => {
              const info = getCardInfo(id);
              if (!info) return null;
              return (
                <div key={id} className="aspect-[3/4] rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden relative">
                  <div className="w-full h-full" style={{ background: `${info.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                    <div className="w-full h-[60%] flex items-center justify-center">
                      {info.faceUrl && (
                        <div className="w-[65%] h-[65%] flex items-center justify-center">
                          <img src={info.faceUrl} alt={info.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <div className="w-full h-[40%] bg-[var(--color-surface)] border-t border-[var(--color-border)] p-2 flex flex-col justify-center">
                      <span className="text-sm font-bold text-center leading-tight">{info.name}</span>
                      {info.sub && <span className="text-[10px] text-[var(--color-muted)] text-center">{info.sub}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Duplicates */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Postales repetidas</h2>
          <Pill variant="warning">{duplicateIds.length} para intercambiar</Pill>
        </div>
        {duplicateIds.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No tienes postales repetidas. ¡Sigue abriendo sobres!</p>
        ) : (
          <div className="flex gap-4 flex-wrap">
            {duplicateIds.map((id) => {
              const info = getCardInfo(id);
              if (!info) return null;
              return (
                <div key={id} className="w-40">
                  <div className="aspect-[3/4] rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden relative">
                    <div className="w-full h-full" style={{ background: `${info.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                      <span className="text-xs font-semibold text-white">{info.name} · Repetida</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button className="flex-1 px-2 py-1.5 rounded-full border-[1.5px] border-[var(--color-border)] text-xs font-semibold text-[var(--color-fg)] cursor-pointer transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                      Intercambiar
                    </button>
                    <button
                      onClick={() => handleDiscard(id)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-xs font-semibold text-[var(--color-danger)] cursor-pointer transition-colors hover:bg-[var(--color-danger)]/20"
                    >
                      <Trash2 size={12} /> {info.overall ? `+${coinValue(info.overall)}` : "+150"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active trades */}
      {state.trades.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Intercambios en curso</h2>
          </div>
          <div className="flex flex-col gap-3">
            {state.trades.map((trade) => (
              <div key={trade.id} className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3.5 px-[18px]">
                <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${trade.direction === "sent" ? "bg-[var(--color-field-soft)] text-[var(--color-field)]" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"}`}>
                  {trade.direction === "sent" ? <Send size={18} strokeWidth={2} /> : <Inbox size={18} strokeWidth={2} />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {trade.direction === "sent" ? `Enviaste ${trade.offeredCardName} a ${trade.fromUser}` : `Solicitaste ${trade.cardName} de ${trade.fromUser}`}
                  </div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">Solicitado el {new Date(trade.date).toLocaleDateString("es-CR")}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  trade.status === "completed" ? "bg-[oklch(94%_0.06_156)] text-[var(--color-success)]" :
                  trade.status === "cancelled" ? "bg-[oklch(94%_0.05_22)] text-[var(--color-danger)]" :
                  "bg-[oklch(95%_0.06_72)] text-[var(--color-warning)]"
                }`}>
                  {trade.status === "pending" ? "Pendiente" : trade.status === "completed" ? "Completado" : "Cancelado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ num, label }: { num: number | string; label: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 text-center">
      <div className="font-[var(--font-display)] text-[36px] font-bold text-[var(--color-accent)] tracking-tight">{num}</div>
      <div className="text-[13px] text-[var(--color-muted)] uppercase tracking-widest mt-1.5">{label}</div>
    </div>
  );
}
