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
import { generateMixedPack, type PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";
import { PackageOpen, Sparkles } from "lucide-react";

function PackOpenerContent() {
  const searchParams = useSearchParams();
  const teamParam = searchParams.get("team") || "argentina";
  const { state, openPack, collectCard, addPacks } = useGame();

  const [stage, setStage] = useState<"idle" | "torn" | "reveal" | "summary">("idle");
  const [currentPack, setCurrentPack] = useState<PackCard[]>([]);
  const [flipped, setFlipped] = useState(0);

  const team = TEAMS[teamParam] || TEAMS.argentina;

  const handleTearComplete = useCallback(() => {
    if (state.packs <= 0) return;
    openPack(teamParam);

    const cards = generateMixedPack(state.collected);
    setCurrentPack(cards);
    setFlipped(0);
    setStage("reveal");
  }, [state.packs, state.collected, openPack, teamParam]);

  const handleFlipCard = useCallback(
    (_idx: number) => {
      setFlipped((prev) => {
        const next = prev + 1;
        if (next >= currentPack.length) {
          currentPack.forEach((card) => collectCard(card.id));
          setTimeout(() => setStage("summary"), 700);
        }
        return next;
      });
    },
    [currentPack, collectCard]
  );

  const handleOpenAnother = useCallback(() => {
    if (state.packs > 0) {
      setStage("idle");
      setCurrentPack([]);
      setFlipped(0);
    }
  }, [state.packs]);

  if (state.packs <= 0 && stage === "idle") {
    return (
      <AppShell>
        <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Abrir sobre</h1>
        <p className="text-[var(--color-muted)] text-[15px] mb-8">Cada sobre contiene 6 postales. Abrí el sobre para descubrir qué postales te tocaron.</p>
        <EmptyState
          icon={<PackageOpen size={36} strokeWidth={1.5} />}
          title="Sin sobres disponibles"
          description="Ya abriste todos tus sobres. Conseguí más participando en intercambios o completando desafíos."
          action={
            <div className="flex gap-3 justify-center">
              <Link
                href="/album"
                className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Ir al álbum
              </Link>
              <button
                onClick={() => addPacks(3)}
                className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold cursor-pointer transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                +3 sobres (demo)
              </button>
            </div>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">
        {stage === "idle" && "Abrir sobre"}
        {stage === "reveal" && "Revelá tus postales"}
        {stage === "summary" && "Resultado del sobre"}
      </h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-8">
        {stage === "idle" && "Tocá el sobre para rasgarlo y descubrir 6 postales al azar."}
        {stage === "reveal" && `Tocá cada postal para voltearla. ${currentPack.length - flipped} restante${currentPack.length - flipped !== 1 ? "s" : ""}.`}
        {stage === "summary" && "¡Sobre abierto! Mirá lo que te tocó."}
      </p>

      <div className="max-w-[640px] mx-auto text-center">
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

        {/* Stage: Card reveal with cascade */}
        {stage === "reveal" && (
          <>
            <p className="text-[var(--color-muted)] text-[15px] mb-8">
              Tocá cada postal para revelarla
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
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <PackSummary
          show={stage === "summary"}
          cards={currentPack}
          teamFlag={team.flag}
          teamName={team.name}
          onOpenAnother={handleOpenAnother}
        />
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
