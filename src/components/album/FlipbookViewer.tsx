"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import { StickerSlot } from "@/components/album/StickerSlot";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGame } from "@/context/GameContext";
import { TEAM_LIST } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import { ChevronLeft, ChevronRight, PackageOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SPECIAL_PLAYERS = new Set(["arg4", "por5", "fra1", "bra2", "cro2", "eng1", "esp1", "mar1", "esp3", "eng2", "col1", "uru1", "ned1", "ger1"]);

export function FlipbookViewer() {
  const { isCollected } = useGame();
  const router = useRouter();
  const flipRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const onInit = useCallback((e: { data: number }) => {
    setTotalPages(e.data);
    setCurrentPage(0);
    setIsReady(true);
  }, []);

  const goNext = useCallback(() => {
    flipRef.current?.pageFlip()?.flipNext("top");
  }, []);

  const goPrev = useCallback(() => {
    flipRef.current?.pageFlip()?.flipPrev("top");
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const currentTeamIndex = currentPage - 1; // page 0 = cover
  const currentTeam = currentTeamIndex >= 0 && currentTeamIndex < TEAM_LIST.length ? TEAM_LIST[currentTeamIndex] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Navigation bar */}
      <div className="flex items-center justify-between w-full max-w-[800px] gap-4 px-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Volver
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={currentPage <= 0}
            className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm text-[var(--color-muted)] font-medium min-w-[100px] text-center">
            {isReady && currentTeam ? `${currentTeamIndex + 1} / ${TEAM_LIST.length}` : isReady ? "Portada" : "..."}
          </span>

          <button
            onClick={goNext}
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {currentTeam && (
          <Link
            href={`/pack-opener?team=${currentTeam.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold no-underline hover:bg-[var(--color-accent-hover)] transition-colors shrink-0"
          >
            <PackageOpen size={14} strokeWidth={2} /> Sobres
          </Link>
        )}
      </div>

      {/* Flipbook */}
      <div className="flipbook-wrapper">
        {!isReady && (
          <div className="flex items-center justify-center w-[800px] h-[560px] max-sm:w-[360px] max-sm:h-[500px] text-[var(--color-muted)]">
            Cargando...
          </div>
        )}

        <div style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s" }}>
          <HTMLFlipBook
            ref={flipRef}
            width={400}
            height={560}
            size="fixed"
            minWidth={180}
            maxWidth={400}
            minHeight={252}
            maxHeight={560}
            showCover={true}
            showPageCorners={true}
            flippingTime={600}
            usePortrait={false}
            startPage={0}
            drawShadow={true}
            maxShadowOpacity={0.3}
            mobileScrollSupport={true}
            swipeDistance={30}
            clickEventForward={true}
            useMouseEvents={true}
            onFlip={onFlip}
            onInit={onInit}
          >
            {/* Cover */}
            <div className="h-full bg-[linear-gradient(160deg,var(--color-accent),oklch(55%_0.14_68),oklch(42%_0.12_68))] flex flex-col items-center justify-center text-white">
              <div className="text-center p-6">
                <span className="text-[64px] block mb-3 drop-shadow-lg">🏆</span>
                <h1 className="font-[var(--font-display)] text-[24px] font-extrabold tracking-tight mb-1.5">
                  StickerHub
                </h1>
                <p className="font-[var(--font-display)] text-[15px] font-bold tracking-[0.2em] uppercase opacity-80">
                  FIFA World Cup
                </p>
                <p className="text-xs opacity-50 mt-3">2026</p>
                <p className="text-[10px] opacity-30 mt-4">{TEAM_LIST.length} selecciones</p>
              </div>
            </div>

            {/* Team spreads */}
            {TEAM_LIST.map((team) => {
              const players = PLAYERS[team.id] || [];
              const collected = players.filter((p) => isCollected(p.id));
              const total = players.length;
              const pct = total > 0 ? Math.round((collected.length / total) * 100) : 0;
              const isComplete = pct === 100;

              return (
                <div key={team.id} className="flipbook-page">
                  <div className="flex flex-col h-full bg-[var(--color-surface)]">
                    {/* Team header */}
                    <div
                      className="shrink-0 px-5 py-4 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${team.color}, ${team.colorDark})`,
                      }}
                    >
                      {/* Decorative pattern */}
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage: "repeating-linear-gradient(-30deg, transparent, transparent 8px, rgba(255,255,255,0.6) 8px, rgba(255,255,255,0.6) 9px)",
                        }}
                      />

                      <div className="relative flex items-center gap-4">
                        {/* Flag + crest */}
                        <div className="w-[56px] h-[56px] rounded-xl grid place-items-center text-[28px] shrink-0 bg-white/10 backdrop-blur-sm shadow-sm">
                          {team.flag}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-0.5 font-semibold">
                            Selección
                          </p>
                          <h2 className="font-[var(--font-display)] text-[22px] font-extrabold tracking-tight leading-tight text-white">
                            {team.name}
                          </h2>
                        </div>

                        {/* Progress pill */}
                        <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <span className="font-[var(--font-display)] text-lg font-extrabold text-white">
                            {collected.length}/{total}
                          </span>
                          {isComplete && (
                            <span className="text-[10px] font-bold text-[var(--color-success)]">✓</span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar under header */}
                      <div className="relative mt-3">
                        <ProgressBar pct={pct} color={isComplete ? "var(--color-success)" : "rgba(255,255,255,0.4)"} />
                      </div>
                    </div>

                    {/* Sticker grid */}
                    <div className="flex-1 p-3 overflow-auto">
                      <div className="grid grid-cols-5 gap-2">
                        {players.map((p, i) => {
                          const collected2 = isCollected(p.id);
                          return (
                            <StickerSlot
                              key={p.id}
                              id={p.id}
                              collected={collected2}
                              name={p.name}
                              num={p.num}
                              pos={p.pos}
                              gradient={`linear-gradient(180deg, ${team.color} 0%, ${team.colorDark} 100%)`}
                              albumNumber={i + 1}
                              teamName={team.name}
                              isSpecial={SPECIAL_PLAYERS.has(p.id)}
                              faceUrl={p.faceUrl}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Page number */}
                    <div className="shrink-0 flex justify-end px-4 pb-2">
                      <span className="text-[9px] text-[var(--color-muted)]/30 tracking-wider">
                        {TEAM_LIST.indexOf(team) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Back cover */}
            <div className="h-full bg-[linear-gradient(160deg,oklch(42%_0.12_68),oklch(55%_0.14_68),var(--color-accent))] flex items-center justify-center text-white">
              <div className="text-center p-6">
                <span className="text-[40px] block mb-2 opacity-40">🏆</span>
                <p className="font-[var(--font-display)] text-xs font-bold tracking-[0.2em] uppercase opacity-50">
                  Mundial FIFA 2026
                </p>
              </div>
            </div>
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  );
}
