"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGame } from "@/context/GameContext";
import { ALL_PLAYERS } from "@/data/players";
import { TEAMS, TEAM_LIST } from "@/data/teams";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabase/client";
import { coinValue } from "@/hooks/useSupabasePacks";
import { Search, WalletCards, Send, Inbox, Trash2, Filter } from "lucide-react";

interface CardInfo {
  name: string;
  gradient: string;
  sub?: string;
  type: string;
  teamId?: string;
  pos?: string;
  faceUrl?: string;
  overall?: number;
}

function getCardInfo(id: string): CardInfo | null {
  const player = ALL_PLAYERS.find((p) => p.id === id);
  if (player) {
    const team = TEAMS[player.teamId];
    return {
      name: player.name,
      gradient: team ? `linear-gradient(180deg, ${team.color} 0%, ${team.colorDark} 100%)` : "linear-gradient(180deg, oklch(72% 0.1 250), oklch(58% 0.12 250))",
      sub: `${player.pos} · #${player.num}`,
      type: "Jugador",
      teamId: player.teamId,
      pos: player.pos,
      faceUrl: player.faceUrl,
      overall: player.overall ?? 0,
    };
  }
  return null;
}

const CARD_TYPE_OPTIONS = ["todos", "jugadores"] as const;
type CardTypeFilter = (typeof CARD_TYPE_OPTIONS)[number];

const POS_OPTIONS: { id: string; label: string }[] = [
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

export default function MyCardsPage() {
  const { state, isCollected, isDuplicate, coins } = useGame();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>("todos");
  const [teamFilter, setTeamFilter] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [overallFilter, setOverallFilter] = useState<{ min: number; max: number } | null>(null);
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set());
  const [localCoins, setLocalCoins] = useState(coins);
  const [localDupeCount, setLocalDupeCount] = useState<number | null>(null);

  const collectedIds = Object.keys(state.collected).filter((id) => isCollected(id));
  const duplicateIds = state.duplicates.filter((id) => !discardedIds.has(id));
  const displayDupeCount = localDupeCount ?? duplicateIds.length;
  const totalPlayerCards = ALL_PLAYERS.length;
  const playerCollected = ALL_PLAYERS.filter((p) => isCollected(p.id)).length;
  const totalAll = totalPlayerCards;

  const availableTeams = useMemo(() => {
    return TEAM_LIST.map((t) => ({ id: t.id, name: t.name }));
  }, []);

  const filteredCollected = useMemo(() => {
    return collectedIds.filter((id) => {
      const info = getCardInfo(id);
      if (!info) return false;
      if (cardTypeFilter === "jugadores" && info.type !== "Jugador") return false;
      if (teamFilter && info.teamId !== teamFilter) return false;
      if (posFilter && info.pos !== posFilter) return false;
      if (overallFilter && (info.overall === undefined || info.overall < overallFilter.min || info.overall > overallFilter.max)) return false;
      if (search && !info.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [collectedIds, cardTypeFilter, teamFilter, posFilter, overallFilter, search]);

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

    const { data: packData } = await sb
      .from("user_packs")
      .select("coins")
      .eq("user_id", user.id)
      .single();

    const newCoins = (packData?.coins ?? 0) + value;
    await sb.from("user_packs").upsert({ user_id: user.id, coins: newCoins, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    setDiscardedIds((prev) => new Set(prev).add(cardId));
    setLocalDupeCount((prev) => (prev ?? duplicateIds.length) - 1);
    setLocalCoins(newCoins);

    addToast(`¡Descartado! +${value} 🪙`, "success");
  };

  const handleClearFilters = () => {
    setSearch("");
    setCardTypeFilter("todos");
    setTeamFilter("");
    setPosFilter("");
    setOverallFilter(null);
  };

  const hasActiveFilters = search || cardTypeFilter !== "todos" || teamFilter || posFilter || overallFilter !== null;

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
        <div className="flex items-center justify-between mb-5 max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Todas mis postales</h2>
          <div className="relative w-full max-w-[260px]">
            <label className="sr-only" htmlFor="my-cards-search">Filtrar postales</label>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true">
              <Search size={16} strokeWidth={2} />
            </span>
            <input
              id="my-cards-search"
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-fg)] transition-colors focus:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Type filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter size={14} className="text-[var(--color-muted)] shrink-0" />
            {CARD_TYPE_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setCardTypeFilter(f);
                  setTeamFilter("");
                  setPosFilter("");
                  setOverallFilter(null);
                }}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border-[1.5px] transition-colors ${
                  cardTypeFilter === f
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
              >
                {f === "todos" ? "Todos" : "Jugadores"}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border-[1.5px] border-[var(--color-danger)]/30 bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Team + Position filters (only for players) */}
          <div className="flex gap-3 flex-wrap items-center">
            {/* Team select */}
            {cardTypeFilter !== "todos" && (
              <>
                <label className="sr-only" htmlFor="team-filter">{cardTypeFilter === "jugadores" ? "Selección" : "Filtrar"}</label>
                <select
                  id="team-filter"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-fg)] min-w-0 max-w-[200px] cursor-pointer transition-colors focus:border-[var(--color-accent)] focus-visible:outline-none"
                >
                  <option value="">
                    {cardTypeFilter === "jugadores" ? "Todas las selecciones" : "Todos"}
                  </option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </>
            )}

            {/* Position filters (only for players) */}
            {(cardTypeFilter === "jugadores" || cardTypeFilter === "todos") && (
              <div className="flex gap-1.5 flex-wrap">
                {POS_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPosFilter(posFilter === p.id ? "" : p.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-[1.5px] transition-colors ${
                      posFilter === p.id
                        ? "bg-[var(--color-field)] border-[var(--color-field)] text-white"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-field)] hover:text-[var(--color-field)]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Overall rating filter (only for players) */}
            {(cardTypeFilter === "jugadores" || cardTypeFilter === "todos") && (
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-[11px] text-[var(--color-muted)] font-medium">Rating:</span>
                {OVERALL_OPTIONS.map((o) => {
                  const isActive = overallFilter?.min === o.min && overallFilter?.max === o.max;
                  return (
                    <button
                      key={o.label}
                      onClick={() => setOverallFilter(isActive ? null : { min: o.min, max: o.max })}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-[1.5px] transition-colors ${
                        isActive
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                          : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {filteredCollected.length === 0 ? (
          <EmptyState
            icon={<WalletCards size={36} strokeWidth={1.5} />}
            title={hasActiveFilters ? "Sin resultados" : "Sin postales"}
            description={hasActiveFilters ? "No se encontraron postales con los filtros seleccionados." : "Aún no tienes postales. ¡Abre un sobre para comenzar!"}
          />
        ) : (
          <>
            <p className="text-xs text-[var(--color-muted)] mb-3">{filteredCollected.length} postal{filteredCollected.length !== 1 ? "es" : ""} encontrada{filteredCollected.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-6 gap-3 max-lg:grid-cols-4 max-sm:grid-cols-3">
              {filteredCollected.map((id) => {
                const info = getCardInfo(id);
                if (!info) return null;
                return (
                  <Link key={id} href={`/card/${id}`} className="block aspect-[3/4] rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden relative no-underline transition-shadow hover:shadow-md cursor-pointer">
                    <div className="w-full h-full" style={{ background: `${info.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                      <div className="w-full h-[60%] flex items-center justify-center">
                        {info.faceUrl && (
                          <div className="w-[65%] h-[65%] flex items-center justify-center">
                            <img src={info.faceUrl} alt={info.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      <div className="w-full h-[40%] bg-[var(--color-surface)] border-t border-[var(--color-border)] p-2 flex flex-col justify-center">
                        <span className="text-sm font-bold text-center leading-tight text-[var(--color-fg)]">{info.name}</span>
                        {info.sub && <span className="text-[10px] text-[var(--color-muted)] text-center">{info.sub}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Duplicates */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Postales repetidas</h2>
          <Pill variant="warning">{displayDupeCount} para intercambiar</Pill>
        </div>
        {displayDupeCount === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No tienes postales repetidas. ¡Sigue abriendo sobres!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {duplicateIds.map((id) => {
              const info = getCardInfo(id);
              if (!info) return null;
              return (
                <div key={id} className="w-full">
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
                      <Trash2 size={12} /> {info.overall ? `+${coinValue(info.overall, id)}` : "+150"}
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
