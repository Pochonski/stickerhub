"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import { StickerSlot } from "@/components/album/StickerSlot";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGame } from "@/context/GameContext";
import { TEAM_LIST, TEAMS } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import { ChevronLeft, ChevronRight, PackageOpen, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

const SPECIAL_PLAYERS = new Set(["arg4", "por5", "fra1", "bra2", "cro2", "eng1", "esp1", "mar1", "esp3", "eng2", "col1", "uru1", "ned1", "ger1"]);

export function FlipbookViewer() {
  const { isCollected } = useGame();
  const router = useRouter();
  const flipRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Paste animation state
  const [pasteCards, setPasteCards] = useState<string[]>([]);
  const [pasteIndex, setPasteIndex] = useState(0);
  const [pastePhase, setPastePhase] = useState<"idle" | "show" | "done">("idle");

  useEffect(() => {
    if (!isReady) return;
    const raw = sessionStorage.getItem("stickerhub-paste-cards");
    if (!raw) return;
    sessionStorage.removeItem("stickerhub-paste-cards");
    try {
      const ids: string[] = JSON.parse(raw);
      if (ids.length === 0) return;
      setPasteCards(ids);
      setPasteIndex(0);
      setPastePhase("show");
      // Flip to first card's team page
      const firstCard = PLAYERS[Object.keys(PLAYERS).find(k => PLAYERS[k].some(p => p.id === ids[0])) ?? ""]?.find(p => p.id === ids[0]);
      if (firstCard) {
        const teamIdx = TEAM_LIST.findIndex(t => t.id === firstCard.teamId);
        if (teamIdx >= 0) {
          setTimeout(() => flipRef.current?.pageFlip()?.flip(teamIdx * 2 + 2), 400);
        }
      }
    } catch {}
  }, [isReady]);

  // Auto-advance paste animation
  useEffect(() => {
    if (pastePhase !== "show" || pasteCards.length === 0) return;
    const t = setTimeout(() => {
      if (pasteIndex >= pasteCards.length - 1) {
        setPastePhase("done");
      } else {
        const nextIdx = pasteIndex + 1;
        setPasteIndex(nextIdx);
        // Flip to next card's team page
        const nextCard = PLAYERS[Object.keys(PLAYERS).find(k => PLAYERS[k].some(p => p.id === pasteCards[nextIdx])) ?? ""]?.find(p => p.id === pasteCards[nextIdx]);
        if (nextCard) {
          const teamIdx = TEAM_LIST.findIndex(t => t.id === nextCard.teamId);
          if (teamIdx >= 0) {
            setTimeout(() => flipRef.current?.pageFlip()?.flip(teamIdx * 2 + 2), 300);
          }
        }
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [pastePhase, pasteIndex, pasteCards]);

  const dismissPaste = () => { setPastePhase("done"); };

  const currentTeamIndex = currentPage - 1; // page 0 = cover
  const currentTeam = currentTeamIndex >= 0 && currentTeamIndex < TEAM_LIST.length ? TEAM_LIST[currentTeamIndex] : null;

  return (
    <>
    <div className="flex flex-col items-center gap-4">
      {/* Navigation bar */}
      <div className="flex items-center justify-between w-full max-w-[800px] gap-2 md:gap-4 px-2 md:px-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Volver</span>
        </button>

        <div className="flex items-center gap-2 md:gap-3 order-1 sm:order-none">
          <button
            onClick={goPrev}
            disabled={currentPage <= 0}
            className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} className="md:size-5" />
          </button>

          <span className="text-xs md:text-sm text-[var(--color-muted)] font-medium min-w-[80px] md:min-w-[100px] text-center">
            {isReady && currentTeam ? `${currentTeamIndex + 1} / ${TEAM_LIST.length}` : isReady ? "Portada" : "..."}
          </span>

          <button
            onClick={goNext}
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} className="md:size-5" />
          </button>
        </div>

        {currentTeam && (
          <Link
            href={`/pack-opener?team=${currentTeam.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold no-underline hover:bg-[var(--color-accent-hover)] transition-colors shrink-0"
          >
            <PackageOpen size={14} strokeWidth={2} /> <span className="hidden sm:inline">Sobres</span>
          </Link>
        )}
      </div>

      {/* Flipbook */}
      <div className="flipbook-wrapper">
        {!isReady && (
          <div className="flex items-center justify-center w-full max-w-[360px] sm:max-w-[800px] h-[500px] sm:h-[560px] text-[var(--color-muted)]">
            Cargando...
          </div>
        )}

        <div style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s" }}>
          <HTMLFlipBook
            ref={flipRef}
            width={isMobile ? 260 : 400}
            height={isMobile ? 365 : 560}
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
            <div className="h-full relative">
              <img src="/portada.jpeg" alt="StickerHub Portada" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Team spreads */}
            {TEAM_LIST.map((team) => {
              const players = PLAYERS[team.id] || [];
              const collected = players.filter((p) => isCollected(p.id));
              const total = players.length;
              const pct = total > 0 ? Math.round((collected.length / total) * 100) : 0;
              const isComplete = pct === 100;

              return (
                <div key={team.id} className="flipbook-page relative">
                  <img src={`/fondo-${TEAM_LIST.indexOf(team) % 2 === 0 ? 'izq' : 'der'}.jpeg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none z-0" />
                  <div className="relative z-[1] flex flex-col h-full">
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
                    <div className="flex-1 p-2 md:p-3 overflow-auto">
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 md:gap-2">
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
                              flag={team.flag}
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
            <div className="h-full relative">
              <img src="/portada.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            </div>
          </HTMLFlipBook>
        </div>
      </div>
    </div>
    {pastePhase !== "idle" && (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm" onClick={dismissPaste}>
        {pastePhase === "show" && pasteCards[pasteIndex] && (() => {
          const cardId = pasteCards[pasteIndex];
          const player = PLAYERS[Object.keys(PLAYERS).find(k => PLAYERS[k].some(p => p.id === cardId)) ?? ""]?.find(p => p.id === cardId);
          const team = player ? TEAMS[player.teamId] : null;
          if (!player) return null;
          return (
            <div className="flex flex-col items-center gap-3 animate-sticker-paste" onClick={(e) => e.stopPropagation()}>
              <div className="w-[140px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl" style={{ background: `url('/card-bg.png') center/cover, ${team ? `linear-gradient(180deg, ${team.color} 0%, ${team.colorDark} 50%, white 50%, #f8f8f8 100%)` : 'oklch(72% 0.1 250)'}`, backgroundBlendMode: "overlay" }}>
                <div className="w-full h-[55%] flex items-end justify-center">
                  {player.faceUrl ? (
                    <img src={player.faceUrl} alt={player.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-2xl font-extrabold text-white/20 font-[var(--font-display)]">{player.num}</span>
                  )}
                </div>
                <div className="bg-white/95 p-2 text-center flex-1 flex flex-col justify-center">
                  {team?.flag && <span className="text-base block leading-none mb-0.5">{team.flag}</span>}
                  <span className="text-[10px] font-bold leading-tight">{player.name}</span>
                  <span className="text-[7px] text-[var(--color-muted)]">{player.pos} · #{player.num}</span>
                </div>
              </div>
              <div className="animate-paste-badge">
                <span className="bg-[var(--color-success)] text-white text-sm font-extrabold px-4 py-1.5 rounded-full shadow-lg">¡PEGADA!</span>
              </div>
              <p className="text-white/40 text-xs">{pasteIndex + 1} de {pasteCards.length}</p>
            </div>
          );
        })()}
        {pastePhase === "done" && (
          <div className="flex flex-col items-center gap-3">
            <Check size={40} className="text-[var(--color-success)]" />
            <p className="text-white text-lg font-semibold">¡{pasteCards.length} {pasteCards.length === 1 ? "pegada" : "pegadas"}!</p>
            <p className="text-white/30 text-xs">Tocá para cerrar</p>
          </div>
        )}
        <p className="absolute bottom-4 text-[10px] text-white/15">{pastePhase === "show" ? "Tocá para saltar" : ""}</p>
      </div>
    )}
  </>
);
}