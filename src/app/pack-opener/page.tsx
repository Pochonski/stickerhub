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
import { PackageOpen, Sparkles } from "lucide-react";

const QUANTITY_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 25, 50];

function PackOpenerContent() {
  const searchParams = useSearchParams();
  const teamParam = searchParams.get("team") || "argentina";
  const { state, openPacks, collectCard, refreshCollection } = useGame();
  const { addToast } = useToast();

  const [stage, setStage] = useState<"idle" | "torn" | "reveal" | "summary">("idle");
  const [currentPack, setCurrentPack] = useState<PackCard[]>([]);
  const [flipped, setFlipped] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openedCount, setOpenedCount] = useState(0);

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
      refreshCollection();
      const newCards = allCards.filter((c) => c.isNew).length;
      const dupeCards = allCards.filter((c) => !c.isNew).length;
      addToast(`¡${actualCount} sobres abiertos! ${newCards} nuevas, ${dupeCards} repetidas`, "success");
      setStage("summary");
    } else {
      setStage("reveal");
    }
  }, [state.packs, state.collected, openPacks, quantity, collectCard, refreshCollection, addToast]);

  const handleFlipCard = useCallback(
    (_idx: number) => {
      setFlipped((prev) => {
        const next = prev + 1;
        if (next >= currentPack.length) {
          currentPack.forEach((card) => collectCard(card.id));
          refreshCollection();
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
                🛒 Ir a la tienda
              </Link>
            </div>
          }
        />
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

        {stage === "summary" && currentPack.length > 0 && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-md">
            <h3 className="font-[var(--font-display)] text-xl font-bold mb-4">
              {openedCount > 1 ? `${currentPack.length} stickers de ${openedCount} sobres` : "¡Sobre abierto!"}
            </h3>
            <div className="flex gap-3 justify-center flex-wrap mb-6 max-h-[400px] overflow-y-auto p-2">
              {currentPack.map((card, i) => (
                <div key={i} className="w-[72px] aspect-[3/4] rounded-lg relative overflow-hidden border border-[var(--color-border)] shrink-0">
                  <div className="w-full h-[55%] flex items-center justify-center" style={{ background: `${card.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                    {card.faceUrl ? (
                      <img src={card.faceUrl} alt={card.name} className="w-[60%] aspect-square object-contain" referrerPolicy="no-referrer" />
                    ) : card.num ? (
                      <span className="text-xl font-extrabold text-white/25">{card.num}</span>
                    ) : null}
                  </div>
                  <div className="text-[9px] font-bold p-1 bg-white/90 text-center leading-tight">{card.name}</div>
                  <span
                    className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md font-bold text-[8px] tracking-wide ${
                      card.isNew ? "bg-[oklch(58%_0.16_156_/_0.9)] text-white" : "bg-[oklch(70%_0.14_72_/_0.9)] text-gray-900"
                    }`}
                  >
                    {card.isNew ? "NUEVA" : "REPETIDA"}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleOpenAnother}
              disabled={state.packs <= 0}
              className="px-6 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
            >
              {state.packs > 0 ? `Abrir otro${openedCount > 1 ? "s" : ""} (${state.packs} disponible${state.packs !== 1 ? "s" : ""})` : "Sin sobres"}
            </button>
          </div>
        )}

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
