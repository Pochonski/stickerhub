"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { PACK_BUNDLES } from "@/hooks/useSupabasePacks";
import { TeamSelectModal } from "@/components/shop/TeamSelectModal";
import { TeamPackResult } from "@/components/shop/TeamPackResult";
import { generateTeamPack, type PackCard } from "@/lib/pack-generator";
import { PackageOpen, Coins, Sparkles, Flag, Trash2, Trophy } from "lucide-react";
import { TeamCompleteCelebration } from "@/components/celebration/TeamCompleteCelebration";
import { TEAMS } from "@/data/teams";
import { useState, useCallback } from "react";
import type { Team } from "@/data/types";

export default function ShopPage() {
  const { coins, buyPacks, spendCoins, addCoins, collectCard, refreshCollection, checkTeamCompletions, completedTeams, state } = useGame();
  const { addToast } = useToast();
  const [buying, setBuying] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamPackResult, setTeamPackResult] = useState<PackCard[] | null>(null);
  const [teamPackTeam, setTeamPackTeam] = useState<Team | null>(null);
  const [teamPackLoading, setTeamPackLoading] = useState(false);
  const [teamCelebration, setTeamCelebration] = useState<{ teamId: string; teamName: string; teamFlag: string; teamColor: string } | null>(null);

  const handleBuy = async (bundle: typeof PACK_BUNDLES[0]) => {
    if (coins < bundle.price) return;
    setBuying(true);
    try {
      const ok = await buyPacks(bundle);
      if (ok) {
        addToast(`¡${bundle.label} comprado! ${bundle.savings ? `(${bundle.savings})` : ""}`, "success");
      } else {
        addToast("Error al comprar", "error");
      }
    } catch {
      addToast("Error al comprar", "error");
    }
    setBuying(false);
  };

  const handleTeamSelect = useCallback(async (team: Team) => {
    setShowTeamModal(false);
    setTeamPackLoading(true);
    try {
      const ok = await spendCoins(2000);
      if (!ok) {
        addToast("No tenés suficientes monedas", "error");
        setTeamPackLoading(false);
        return;
      }
      const cards = generateTeamPack(team.id, state.collected);
      if (cards.length === 0) {
        await addCoins(2000);
        addToast("Esta selección no tiene jugadores disponibles", "error");
        setTeamPackLoading(false);
        return;
      }
      cards.forEach((c) => collectCard(c.id));
      await refreshCollection();
      setTimeout(() => {
        checkTeamCompletions().then(teams => {
          if (teams.length > 0) {
            const t = TEAMS[teams[0]];
            setTeamCelebration({ teamId: teams[0], teamName: t.name, teamFlag: t.flag, teamColor: t.color });
          }
        });
      }, 0);
      setTeamPackTeam(team);
      setTeamPackResult(cards);
      const newCount = cards.filter((c) => c.isNew).length;
      addToast(`¡Sobre de ${team.name} abierto! ${newCount} nueva${newCount !== 1 ? "s" : ""}`, "success");
    } catch {
      addToast("Error al abrir el sobre", "error");
    }
    setTeamPackLoading(false);
  }, [spendCoins, addCoins, state.collected, collectCard, refreshCollection, addToast]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-1">Tienda de Sobres</h1>
          <p className="text-[var(--color-muted)] text-[15px]">Comprá sobres con monedas. Ganá monedas descartando repetidas.</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-full px-5 py-2.5 shrink-0">
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
                {bundle.savings}
              </span>
            )}
            <button
              onClick={() => handleBuy(bundle)}
              disabled={buying || coins < bundle.price}
              className="w-full px-5 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {coins < bundle.price ? `Te faltan ${(bundle.price - coins).toLocaleString()}` : "Comprar"}
            </button>
          </div>
        ))}

        {/* Team pack card */}
        <div className="bg-[var(--color-surface)] border-[1.5px] border-[var(--color-accent)]/30 rounded-[var(--radius-lg)] p-6 text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-accent)]/10 grid place-items-center">
              <Flag size={28} className="text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <h3 className="font-[var(--font-display)] text-xl font-bold mb-1">Sobre de Selección</h3>
            <p className="text-sm text-[var(--color-muted)] mb-1">2 cartas del equipo que elijas</p>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Coins size={16} className="text-[var(--color-accent)]" />
              <span className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-accent)]">2,000</span>
            </div>
            <span className="inline-block text-[11px] font-semibold text-[var(--color-success)] bg-[oklch(94%_0.06_156)] px-2 py-0.5 rounded-full mb-3">
              1 asegurada nueva
            </span>
            <button
              onClick={() => setShowTeamModal(true)}
              disabled={teamPackLoading || coins < 2000}
              className="w-full px-5 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {teamPackLoading ? "Abriendo..." : coins < 2000 ? `Te faltan ${(2000 - coins).toLocaleString()}` : "Elegir equipo"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
        <h2 className="font-[var(--font-display)] text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-[var(--color-accent)]" /> Cómo ganar monedas
        </h2>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 text-sm">
          <div className="bg-[var(--color-bg)]/70 rounded-xl p-4">
            <h3 className="font-semibold mb-2"><Trash2 size={14} className="inline mr-1" /> Descartar repetidas</h3>
            <table className="w-full text-xs text-[var(--color-muted)]">
              <tbody>
                <tr><td className="py-1">Cartas Estrella</td><td className="text-right font-bold text-[var(--color-accent)]"><Coins size={12} className="inline" /> 1,300</td></tr>
                <tr><td className="py-1">Rating 90+</td><td className="text-right font-bold text-[var(--color-accent)]"><Coins size={12} className="inline" /> 900</td></tr>
                <tr><td className="py-1">Rating 85-89</td><td className="text-right font-bold text-[var(--color-accent)]"><Coins size={12} className="inline" /> 700</td></tr>
                <tr><td className="py-1">Rating 80-84</td><td className="text-right font-bold text-[var(--color-accent)]"><Coins size={12} className="inline" /> 500</td></tr>
                <tr><td className="py-1">Rating 75-79</td><td className="text-right font-bold text-[var(--color-accent)]"><Coins size={12} className="inline" /> 300</td></tr>
                <tr><td className="py-1">Rating &lt;75</td><td className="text-right font-bold text-[var(--color-accent)]"><Coins size={12} className="inline" /> 150</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-[var(--color-bg)]/70 rounded-xl p-4">
            <h3 className="font-semibold mb-2"><Trophy size={14} className="inline mr-1" /> Completar equipos</h3>
            <p className="text-xs text-[var(--color-muted)] mb-3">Al completar todas las cartas de una selección:</p>
            <span className="font-[var(--font-display)] text-lg font-bold text-[var(--color-success)]"><Coins size={14} className="inline mr-1" />+500</span>
          </div>
        </div>
      </div>

      <TeamSelectModal
        key={showTeamModal ? "open" : "closed"}
        open={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        onSelect={handleTeamSelect}
      />

      <TeamPackResult
        open={!!teamPackResult}
        cards={teamPackResult ?? []}
        teamName={teamPackTeam?.name ?? ""}
        teamFlag={teamPackTeam?.flag ?? ""}
        onClose={() => setTeamPackResult(null)}
      />
      {teamCelebration && (
        <TeamCompleteCelebration
          show={!!teamCelebration}
          teamName={teamCelebration.teamName}
          teamFlag={teamCelebration.teamFlag}
          teamColor={teamCelebration.teamColor}
          reward={500}
          totalCompleted={completedTeams.length}
          onClose={() => setTeamCelebration(null)}
        />
      )}
    </AppShell>
  );
}
