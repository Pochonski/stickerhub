"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabase/client";
import { ALL_PLAYERS } from "@/data/players";
import { ALL_STADIUM_CARDS, ALL_VENUE_CARDS } from "@/data/cards";
import { TEAMS, TEAM_LIST, STADIUMS, VENUES } from "@/data/teams";
import { coinValue } from "@/hooks/useSupabasePacks";
import { Trash2, Coins, Sparkles, Search, Filter } from "lucide-react";

function getCardInfo(id: string): { name: string; gradient: string; sub?: string; type: string; faceUrl?: string; overall?: number; teamId?: string; pos?: string; flag?: string } | null {
  const player = ALL_PLAYERS.find((p) => p.id === id);
  if (player) {
    const team = TEAMS[player.teamId];
    return {
      name: player.name, teamId: player.teamId, type: "Jugador",
      gradient: team ? `linear-gradient(180deg, ${team.color} 0%, ${team.colorDark} 100%)` : "",
      sub: `${player.pos} · #${player.num}`,
      faceUrl: player.faceUrl,
      overall: player.overall ?? 0,
      pos: player.pos,
      flag: team?.flag,
    };
  }
  const stadium = ALL_STADIUM_CARDS.find((c) => c.id === id);
  if (stadium) {
    const t = STADIUMS[stadium.teamId];
    return { name: stadium.name, gradient: stadium.bg, type: "Estadio", flag: t?.flag };
  }
  const venue = ALL_VENUE_CARDS.find((c) => c.id === id);
  if (venue) {
    const t = VENUES[venue.teamId];
    return { name: venue.name, gradient: venue.bg, type: "Sede", flag: t?.flag };
  }
  return null;
}

const TYPE_TABS = [
  { id: "todos", label: "Todos" },
  { id: "jugadores", label: "Jugadores" },
  { id: "estadios", label: "Estadios" },
  { id: "sedes", label: "Sedes" },
] as const;

const POS_OPTIONS = [
  { id: "", label: "Todos" },
  { id: "Arquero", label: "Arqueros" },
  { id: "Defensa", label: "Defensas" },
  { id: "Mediocampista", label: "Mediocampistas" },
  { id: "Delantero", label: "Delanteros" },
];

const OVERALL_OPTIONS = [
  { min: 90, max: 99, label: "90+" },
  { min: 85, max: 89, label: "85-89" },
  { min: 80, max: 84, label: "80-84" },
  { min: 75, max: 79, label: "75-79" },
  { min: 70, max: 74, label: "70-74" },
  { min: 0, max: 69, label: "<70" },
];

export default function DiscardPage() {
  const { state, coins, addCoins, refreshCollection } = useGame();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [nationFilter, setNationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [posFilter, setPosFilter] = useState("");
  const [overallFilter, setOverallFilter] = useState<{ min: number; max: number } | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "">("desc");

  const duplicates = state.duplicates
    .filter((id) => {
    const info = getCardInfo(id);
    if (!info) return false;
    if (search && !info.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (nationFilter && info.teamId !== nationFilter) return false;
    if (typeFilter === "jugadores" && info.type !== "Jugador") return false;
    if (typeFilter === "estadios" && info.type !== "Estadio") return false;
    if (typeFilter === "sedes" && info.type !== "Sede") return false;
    if (posFilter && info.pos !== posFilter) return false;
    if (overallFilter && (info.overall === undefined || info.overall < overallFilter.min || info.overall > overallFilter.max)) return false;
    return true;
  }).sort((a, b) => {
    if (!sortOrder) return 0;
    const va = getCardInfo(a)?.overall ? coinValue(getCardInfo(a)!.overall!, a) : 150;
    const vb = getCardInfo(b)?.overall ? coinValue(getCardInfo(b)!.overall!, b) : 150;
    return sortOrder === "desc" ? vb - va : va - vb;
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

    await addCoins(value);
    addToast(`+${value} 🪙`, "success");
  };

  const handleDiscardAll = async () => {
    if (duplicates.length === 0) return;
    for (const id of duplicates) {
      await handleDiscard(id);
    }
    await refreshCollection();
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

      {state.duplicates.length > 0 && (
        <>
        <div className="flex items-center gap-3 mb-3 max-sm:flex-col max-sm:items-stretch">
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
          <span className="text-xs text-[var(--color-muted)] shrink-0">{duplicates.length} de {state.duplicates.length}</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="px-3 py-1.5 rounded-full text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] cursor-pointer outline-none focus:border-[var(--color-accent)]"
          >
            <option value="desc">Mayor valor</option>
            <option value="asc">Menor valor</option>
            <option value="">Sin ordenar</option>
          </select>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-2">
          {TYPE_TABS.map((t) => (
            <button
              key={t.id} onClick={() => setTypeFilter(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border transition-colors ${
                typeFilter === t.id ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white" : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {(typeFilter === "jugadores" || typeFilter === "todos") && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {POS_OPTIONS.map((p) => (
              <button
                key={p.id} onClick={() => setPosFilter(p.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer border transition-colors ${
                  posFilter === p.id ? "bg-[var(--color-field)] border-[var(--color-field)] text-white" : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-field)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {(typeFilter === "jugadores" || typeFilter === "todos") && (
          <div className="flex gap-1 flex-wrap mb-5">
            {OVERALL_OPTIONS.map((o) => (
              <button
                key={o.label} onClick={() => setOverallFilter(overallFilter?.min === o.min && overallFilter?.max === o.max ? null : { min: o.min, max: o.max })}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border transition-colors ${
                  overallFilter?.min === o.min && overallFilter?.max === o.max ? "bg-[var(--color-field)] border-[var(--color-field)] text-white" : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-field)]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        </>
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
                    {info.flag && <span className="text-sm leading-none mb-0.5">{info.flag}</span>}
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
