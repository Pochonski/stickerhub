"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FlipCard } from "@/components/pack/FlipCard";
import { PackSummary } from "@/components/pack/PackSummary";
import { BoosterPack } from "@/components/pack/BoosterPack";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { generateMixedPack, type PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";
import { PackageOpen, Sparkles, Trophy, ShoppingCart, Coins } from "lucide-react";
import { ALL_PLAYERS } from "@/data/players";
import { coinValue } from "@/hooks/useSupabasePacks";
import { TeamCompleteCelebration } from "@/components/celebration/TeamCompleteCelebration";

const QUANTITY_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 25, 50];

function PackOpenerContent() {
  const searchParams = useSearchParams();
  const teamParam = searchParams.get("team") || "argentina";
  const { state, openPacks, collectCard, refreshCollection, checkTeamCompletions, completedTeams } = useGame();
  const { addToast } = useToast();

  const [stage, setStage] = useState<"idle" | "torn" | "reveal" | "summary">("idle");
  const [currentPack, setCurrentPack] = useState<PackCard[]>([]);
  const [flipped, setFlipped] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openedCount, setOpenedCount] = useState(0);
  const [teamCelebration, setTeamCelebration] = useState<{ teamId: string; teamName: string; teamFlag: string; teamColor: string } | null>(null);

  const team = TEAMS[teamParam] || TEAMS.argentina;

  const handleTearComplete = useCallback(() => {
    if (state.packs <= 0) return;
    
    const actualCount = openPacks(quantity);
    if (actualCount <= 0) return;
    setOpenedCount(actualCount);
    
    // Generate cards for all packs
    const allCards: PackCard[] = [];
    for (let i = 0; i < actualCount; i++) {
      allCards.push(...generateMixedPack(state.collected));
    }
    
    setCurrentPack(allCards);
    setFlipped(0);

    // If opening multiple packs, skip flip animation and collect immediately
    if (actualCount > 1) {
      allCards.forEach((card) => collectCard(card.id));
      refreshCollection().then(() => checkTeamCompletions().then(teams => {
        if (teams.length > 0) {
          const t = TEAMS[teams[0]];
          setTeamCelebration({ teamId: teams[0], teamName: t.name, teamFlag: t.flag, teamColor: t.color });
        }
      }));
      const newCards = allCards.filter((c) => c.isNew).length;
      const dupeCards = allCards.filter((c) => !c.isNew).length;
      addToast(`¡${actualCount} sobres abiertos! ${newCards} nuevas, ${dupeCards} repetidas`, "success");
      setStage("summary");
    } else {
      setStage("reveal");
    }
  }, [state.packs, state.collected, openPacks, quantity, collectCard, refreshCollection, checkTeamCompletions, addToast]);

  const handleFlipCard = useCallback(
    (_idx: number) => {
      setFlipped((prev) => {
        const next = prev + 1;
        if (next >= currentPack.length) {
          currentPack.forEach((card) => collectCard(card.id));
          refreshCollection().then(() => checkTeamCompletions().then(teams => {
            if (teams.length > 0) {
              const t = TEAMS[teams[0]];
              setTeamCelebration({ teamId: teams[0], teamName: t.name, teamFlag: t.flag, teamColor: t.color });
            }
          }));
          const newCards = currentPack.filter((c) => c.isNew).length;
          const dupeCards = currentPack.filter((c) => !c.isNew).length;
          addToast(`¡Sobre abierto! ${newCards} nuevas, ${dupeCards} repetidas`, "success");
          setTimeout(() => setStage("summary"), 700);
        }
        return next;
      });
    },
    [currentPack, collectCard, refreshCollection, addToast]
  );

  const handleOpenAnother = useCallback(() => {
    if (state.packs > 0) {
      setStage("idle");
      setCurrentPack([]);
      setFlipped(0);
      setOpenedCount(0);
    }
  }, [state.packs]);

  if (state.packs <= 0 && stage === "idle") {
    return (
      <AppShell>
        <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Abrir sobre</h1>
        <p className="text-[var(--color-muted)] text-[15px] mb-8">Cada sobre contiene 7 stickers aleatorios. Abrí el sobre para descubrir qué te tocó.</p>
        <EmptyState
          icon={<PackageOpen size={36} strokeWidth={1.5} />}
          title="Sin sobres disponibles"
          description="Ganá monedas descartando repetidas o completando equipos. ¡Visita la tienda para comprar más sobres!"
          action={
            <div className="flex gap-3 justify-center">
              <Link
                href="/album"
                className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Ir a la colección
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                <ShoppingCart size={14} className="mr-1 inline" /> Ir a la tienda
              </Link>
            </div>
          }
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

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">
        {stage === "idle" && "Abrir sobres"}
        {stage === "reveal" && "Revelá tus stickers"}
        {stage === "summary" && `Resultado de ${openedCount > 1 ? `${openedCount} sobres` : "sobre"}`}
      </h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-8">
        {stage === "idle" && `Tocá el sobre para rasgarlo. Tenés ${state.packs} disponible${state.packs !== 1 ? "s" : ""}.`}
        {stage === "reveal" && `Tocá cada sticker para voltearlo. ${currentPack.length - flipped} restante${currentPack.length - flipped !== 1 ? "s" : ""}.`}
        {stage === "summary" && "¡Sobres abiertos! Mirá lo que te tocó."}
      </p>

      <div className="max-w-[720px] mx-auto text-center">
        {/* Quantity selector */}
        {stage === "idle" && state.packs > 0 && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-[var(--color-muted)]">Abrir:</span>
            {QUANTITY_OPTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                disabled={q > state.packs}
                className={`px-3 md:px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-none transition-colors ${
                  quantity === q
                    ? "bg-[var(--color-accent)] text-white"
                    : q > state.packs
                    ? "bg-[var(--color-border)] text-[var(--color-muted)]/40 cursor-not-allowed"
                    : "bg-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                }`}
              >
                {q}
              </button>
            ))}
            {state.packs > 10 && (
              <span className="text-xs text-[var(--color-muted)] ml-2">máx {state.packs}</span>
            )}
          </div>
        )}

        {/* Stage: Pack display & tear */}
        {(stage === "idle" || stage === "torn") && (
          <BoosterPack
            teamFlag={team.flag}
            teamName={team.name}
            teamColor={team.color}
            teamColorDark={team.colorDark}
            packsLeft={state.packs}
            onTearComplete={handleTearComplete}
          />
        )}

        {/* Stage: Card reveal with cascade (only for single pack) */}
        {stage === "reveal" && (
          <>
            <p className="text-[var(--color-muted)] text-[15px] mb-8">
              Tocá cada sticker para revelarlo
            </p>
            <div className="flex gap-4 justify-center flex-wrap mx-auto mb-10">
              {currentPack.map((card, i) => (
                <div
                  key={i}
                  className="card-cascade-item"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <FlipCard
                    isFlipped={i < flipped}
                    onFlip={() => handleFlipCard(i)}
                    gradient={card.gradient}
                    name={card.name}
                    num={card.num}
                    pos={card.pos}
                    faceUrl={card.faceUrl}
                    flag={TEAMS[card.teamId]?.flag}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {stage === "summary" && currentPack.length > 0 && (() => {
          const newCount = currentPack.filter((c) => c.isNew).length;
          const dupeCount = currentPack.filter((c) => !c.isNew).length;

          const teamGroups = new Map<string, typeof currentPack>();
          for (const card of currentPack) {
            const list = teamGroups.get(card.teamId) ?? [];
            list.push(card);
            teamGroups.set(card.teamId, list);
          }

          const ratingLookup = new Map(ALL_PLAYERS.map((p) => [p.id, p.overall]));
          let dupeCoins = 0;
          for (const card of currentPack) {
            if (!card.isNew) dupeCoins += coinValue(ratingLookup.get(card.id) ?? 70, card.id);
          }

          return (
            <div className="animate-summary-in">
              {/* Stats Banner */}
              <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md p-6 md:p-8 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/6 via-[var(--color-accent)]/2 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-accent)]/4 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <h3 className="font-[var(--font-display)] text-[22px] md:text-[26px] font-bold text-center flex items-center justify-center gap-2 mb-6">
                    <Trophy size={26} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                    ¡{openedCount} {openedCount === 1 ? "sobre abierto" : "sobres abiertos"}!
                  </h3>

                  <div className="flex gap-3 justify-center flex-wrap">
                    <div className="bg-[var(--color-success)]/10 rounded-[var(--radius-lg)] px-5 py-3.5 text-center min-w-[110px] animate-celebration-enter" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
                      <span className="block font-[var(--font-display)] text-[32px] md:text-[36px] font-bold text-[var(--color-success)] leading-none">{newCount}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-success)] mt-1 block">Nuevas</span>
                    </div>
                    <div className="bg-[var(--color-warning)]/10 rounded-[var(--radius-lg)] px-5 py-3.5 text-center min-w-[110px] animate-celebration-enter" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
                      <span className="block font-[var(--font-display)] text-[32px] md:text-[36px] font-bold text-[var(--color-warning)] leading-none">{dupeCount}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-warning)] mt-1 block">Repetidas</span>
                    </div>
                  </div>

                  {dupeCount > 0 && (
                    <p className="mt-5 text-sm text-[var(--color-muted)] text-center animate-celebration-enter" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
                      Valor estimado al descartar repetidas: <span className="font-bold text-[var(--color-accent)]"><Coins size={14} className="inline" /> +{dupeCoins.toLocaleString()} monedas</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Cards grouped by team */}
              <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-5 mb-6">
                {Array.from(teamGroups.entries()).map(([teamId, cards]) => {
                  const teamData = TEAMS[teamId];
                  return (
                    <div key={teamId} className="animate-celebration-enter" style={{ animationFillMode: "both" }}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="text-base">{teamData?.flag}</span>
                        <h4 className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-fg)]">{teamData?.name ?? teamId}</h4>
                        <span className="text-[11px] text-[var(--color-muted)] font-medium">{cards.length}</span>
                      </div>
                      <div className="flex gap-2.5 justify-center flex-wrap">
                        {cards.map((card, i) => (
                          <div
                            key={`${card.id}-${i}`}
                            className="card-cascade-item"
                            style={{ animationDelay: `${(i % 8) * 50}ms` }}
                          >
                            <div className="w-[84px] aspect-[3/4] rounded-[var(--radius-md)] relative overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                              <div className="w-full h-[55%] flex items-center justify-center" style={{ background: `${card.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                                {card.faceUrl ? (
                                  <img src={card.faceUrl} alt={card.name} className="w-[62%] aspect-square object-contain" referrerPolicy="no-referrer" />
                                ) : card.num ? (
                                  <span className="text-lg font-extrabold text-white/25 font-[var(--font-display)]">{card.num}</span>
                                ) : null}
                              </div>
                              <div className="text-[8px] font-bold p-1 bg-[var(--color-surface)] text-center leading-tight">
                                {teamData?.flag && <span className="text-[7px] block leading-none mb-0.5">{teamData.flag}</span>}
                                {card.name}
                              </div>
                              <span
                                className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md font-bold text-[7.5px] tracking-wide ${
                                  card.isNew ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-warning)] text-gray-900"
                                }`}
                              >
                                {card.isNew ? "NUEVA" : "REPETIDA"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center flex-wrap pt-2">
                <button
                  onClick={handleOpenAnother}
                  disabled={state.packs <= 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
                >
                  <PackageOpen size={16} strokeWidth={2} />
                  {state.packs > 0 ? `Abrir otro${openedCount > 1 ? "s" : ""} (${state.packs} disponible${state.packs !== 1 ? "s" : ""})` : "Sin sobres"}
                </button>
                <Link
                  href="/album"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Volver al album
                </Link>
              </div>
            </div>
          );
        })()}

        {stage === "summary" && currentPack.length === 0 && (
          <PackSummary
            show={true}
            cards={currentPack}
            teamFlag={team.flag}
            teamName={team.name}
            onOpenAnother={handleOpenAnother}
          />
        )}
      </div>
    </AppShell>
  );
}

export default function PackOpenerPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Sparkles size={24} strokeWidth={1.5} className="text-[var(--color-accent)]/50 animate-shimmer" />
        <p className="text-[var(--color-muted)] text-sm">Preparando sobres...</p>
      </div>
    }>
      <PackOpenerContent />
    </Suspense>
  );
}
