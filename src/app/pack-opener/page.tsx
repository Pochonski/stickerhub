"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FlipCard } from "@/components/pack/FlipCard";
import { PackSummary } from "@/components/pack/PackSummary";
import { BoosterPack } from "@/components/pack/BoosterPack";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { generateMixedPack, type PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";
import { PackageOpen, Sparkles, ShoppingCart, Coins } from "lucide-react";
import { ALL_PLAYERS } from "@/data/players";
import { coinValue } from "@/hooks/useSupabasePacks";
import { TeamCompleteCelebration } from "@/components/celebration/TeamCompleteCelebration";
import { ProgressBar } from "@/components/ui/ProgressBar";

const QUANTITY_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 25, 50];

function PackOpenerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamParam = searchParams.get("team") || "argentina";
  const { state, openPacks, collectCard, refreshCollection, checkTeamCompletions, completedTeams, coins } = useGame();
  const { addToast } = useToast();

  const totalCollected = Object.keys(state.collected).length;
  const totalAll = ALL_PLAYERS.length;
  const pct = totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0;

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
      setTimeout(() => {
        refreshCollection().then(() => checkTeamCompletions().then(teams => {
          if (teams.length > 0) {
            const t = TEAMS[teams[0]];
            setTeamCelebration({ teamId: teams[0], teamName: t.name, teamFlag: t.flag, teamColor: t.color });
          }
        }));
      }, 0);
      const newCards = allCards.filter((c) => c.isNew);
      const dupeCards = allCards.filter((c) => !c.isNew).length;
      addToast(`¡${actualCount} sobres abiertos! ${newCards.length} nuevas, ${dupeCards} repetidas`, "success");
      if (newCards.length > 0) {
        sessionStorage.setItem("stickerhub-paste-cards", JSON.stringify(newCards.map(c => c.id)));
        setStage("summary");
        setTimeout(() => router.push("/album/flipbook"), 1200);
      } else {
        setStage("summary");
      }
    } else {
      setStage("reveal");
    }
  }, [state.packs, state.collected, openPacks, quantity, collectCard, refreshCollection, checkTeamCompletions, addToast]);

  const handleFlipCard = useCallback(
    (_idx: number) => {
      setFlipped((prev) => {
        const next = prev + 1;
        return next;
      });
      // Process completion after state settles
      if (flipped + 1 >= currentPack.length) {
        setTimeout(() => {
          currentPack.forEach((card) => collectCard(card.id));
          refreshCollection().then(() => checkTeamCompletions().then(teams => {
            if (teams.length > 0) {
              const t = TEAMS[teams[0]];
              setTeamCelebration({ teamId: teams[0], teamName: t.name, teamFlag: t.flag, teamColor: t.color });
            }
          }));
          const newCards = currentPack.filter((c) => c.isNew);
          const dupeCards = currentPack.filter((c) => !c.isNew).length;
          addToast(`¡Sobre abierto! ${newCards.length} nuevas, ${dupeCards} repetidas`, "success");
          if (newCards.length > 0) {
            sessionStorage.setItem("stickerhub-paste-cards", JSON.stringify(newCards.map(c => c.id)));
            setTimeout(() => { setStage("summary"); setTimeout(() => router.push("/album/flipbook"), 1200); }, 700);
          } else {
            setTimeout(() => setStage("summary"), 700);
          }
        }, 0);
      }
    },
    [currentPack, flipped, collectCard, refreshCollection, checkTeamCompletions, addToast]
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
        <div className="flex items-center justify-between mb-2 max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <div>
            <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-1">Abrir sobres</h1>
            <p className="text-[var(--color-muted)] text-[15px]">Conseguí más sobres para seguir coleccionando.</p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-full px-4 py-2 shrink-0">
            <Coins size={18} className="text-[var(--color-accent)]" />
            <span className="font-[var(--font-display)] text-lg font-bold text-[var(--color-accent)]">{coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-5 max-sm:flex-col max-sm:text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] grid place-items-center shrink-0">
              <PackageOpen size={28} className="text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 max-sm:w-full">
              <h2 className="font-[var(--font-display)] text-lg font-bold mb-1">Sin sobres disponibles</h2>
              <p className="text-sm text-[var(--color-muted)] mb-3">Ganá monedas descartando repetidas o completando equipos para comprar más.</p>
              <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-stretch">
                <span className="text-xs text-[var(--color-muted)]">Progreso: {pct}%</span>
                <div className="flex-1 max-w-[200px]"><ProgressBar pct={pct} /></div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 max-sm:flex-col">
            <Link
              href="/shop"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <ShoppingCart size={16} /> Comprar sobres
            </Link>
            <Link
              href="/discard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <Coins size={16} /> Descartar repetidas
            </Link>
            <Link
              href="/album"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Ver colección
            </Link>
          </div>
        </div>
      {teamCelebration && (
        <TeamCompleteCelebration
          show={!!teamCelebration}
          teamName={teamCelebration.teamName}
          teamFlag={teamCelebration.teamFlag}
          teamColor={teamCelebration.teamColor}
          reward={2000}
          totalCompleted={completedTeams.length}
          onClose={() => setTeamCelebration(null)}
        />
      )}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-2 max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {stage !== "summary" && <span className="text-xl">{team.flag}</span>}
            <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight">
              {stage === "idle" && `Abrir sobres${teamParam !== "argentina" ? ` · ${team.name}` : ""}`}
              {stage === "torn" && "Abriendo..."}
              {stage === "reveal" && "Revelá tus stickers"}
              {stage === "summary" && `Resultado de ${openedCount} ${openedCount === 1 ? "sobre" : "sobres"}`}
            </h1>
          </div>
          <p className="text-[var(--color-muted)] text-[15px]">
            {stage === "idle" && `Tenés ${state.packs} sobre${state.packs !== 1 ? "s" : ""}. Tocá para rasgar.${state.packs > 1 ? ` Elegí cuántos abrir.` : ""}`}
            {stage === "torn" && "Rasgando el sobre..."}
            {stage === "reveal" && `Tocá cada sticker para voltearlo. ${flipped} de ${currentPack.length} revelados.`}
            {stage === "summary" && "¡Sobres abiertos! Mirá lo que te tocó."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-full px-4 py-2 shrink-0">
          <Coins size={18} className="text-[var(--color-accent)]" />
          <span className="font-[var(--font-display)] text-lg font-bold text-[var(--color-accent)]">{coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto text-center mt-6">
        {/* Quantity selector */}
        {stage === "idle" && state.packs > 0 && (
          <div className="mb-6">
            <p className="text-xs text-[var(--color-muted)] mb-3 uppercase tracking-wider">Cantidad a abrir</p>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {QUANTITY_OPTIONS.filter(q => q <= state.packs || q <= 10).map((q) => {
                const disabled = q > state.packs;
                return (
                  <button
                    key={q}
                    onClick={() => !disabled && setQuantity(q)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-full text-sm font-semibold cursor-pointer border-none transition-all ${
                      quantity === q
                        ? "bg-[var(--color-accent)] text-white shadow-md scale-105"
                        : disabled
                        ? "bg-[var(--color-border)]/50 text-[var(--color-muted)]/30 cursor-not-allowed"
                        : "bg-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {q}{q <= 5 && ` sobre${q !== 1 ? "s" : ""}`}
                  </button>
                );
              })}
              {state.packs > 10 && (
                <span className="text-xs text-[var(--color-muted)] ml-2">máx {state.packs}</span>
              )}
            </div>
            {quantity > 1 && (
              <p className="text-xs text-[var(--color-muted)] mt-2">{quantity * 6} stickers en total</p>
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
            <p className="text-sm text-[var(--color-muted)] mb-6">
              <span className="font-semibold text-[var(--color-accent)]">{flipped}</span> de <span className="font-semibold">{currentPack.length}</span> revelados
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
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-xl">{team.flag}</span>
                    <h3 className="font-[var(--font-display)] text-[20px] md:text-[24px] font-bold text-center">
                      ¡{openedCount} {openedCount === 1 ? "sobre abierto" : "sobres abiertos"}!
                    </h3>
                  </div>

                  <div className="flex gap-3 justify-center flex-wrap mb-4">
                    <div className="bg-[var(--color-success)]/10 rounded-[var(--radius-lg)] px-5 py-3.5 text-center min-w-[100px] animate-celebration-enter" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
                      <span className="block font-[var(--font-display)] text-[32px] md:text-[40px] font-bold text-[var(--color-success)] leading-none">{newCount}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-success)] mt-1 block">Nuevas</span>
                    </div>
                    <div className="bg-[var(--color-warning)]/10 rounded-[var(--radius-lg)] px-5 py-3.5 text-center min-w-[100px] animate-celebration-enter" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
                      <span className="block font-[var(--font-display)] text-[32px] md:text-[40px] font-bold text-[var(--color-warning)] leading-none">{dupeCount}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-warning)] mt-1 block">Repetidas</span>
                    </div>
                  </div>

                  {dupeCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mx-auto block text-center animate-celebration-enter" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
                      <Coins size={14} className="text-[var(--color-accent)]" />
                      <span className="text-xs text-[var(--color-muted)]">Valor estimado: <span className="font-bold text-[var(--color-accent)]">+{dupeCoins.toLocaleString()}</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards grouped by team */}
              <div className="space-y-5 mb-6">
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
                            <div className="w-[100px] max-sm:w-[84px] aspect-[3/4] rounded-[var(--radius-md)] relative overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                              <div className="w-full h-[55%] flex items-center justify-center" style={{ background: `${card.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                                {card.faceUrl ? (
                                  <img src={card.faceUrl} alt={card.name} className="w-[62%] aspect-square object-contain" referrerPolicy="no-referrer" />
                                ) : card.num ? (
                                  <span className="text-lg font-extrabold text-white/25 font-[var(--font-display)]">{card.num}</span>
                                ) : null}
                              </div>
                              <div className="text-[9px] font-bold p-1.5 bg-[var(--color-surface)] text-center leading-tight">
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40 min-h-[44px]"
                >
                  <PackageOpen size={16} strokeWidth={2} />
                  {state.packs > 0 ? `Abrir otro${openedCount > 1 ? "s" : ""} (${state.packs} disponible${state.packs !== 1 ? "s" : ""})` : "Sin sobres"}
                </button>
                {state.packs <= 0 && (
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-primary-hover)] min-h-[44px]"
                  >
                    <ShoppingCart size={16} /> Comprar sobres
                  </Link>
                )}
                <Link
                  href="/album"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] min-h-[44px]"
                >
                  Ver colección
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
