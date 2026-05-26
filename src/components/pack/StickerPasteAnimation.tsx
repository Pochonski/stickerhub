"use client";

import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
import type { PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";
import { PLAYERS } from "@/data/players";

interface Props {
  show: boolean;
  cards: PackCard[];
  onComplete: () => void;
}

function getAlbumSlots(teamId: string): { num: number; id: string }[] {
  const players = PLAYERS[teamId] ?? [];
  return players
    .filter((p) => p.num > 0)
    .sort((a, b) => a.num - b.num)
    .map((p) => ({ num: p.num, id: p.id }));
}

export function StickerPasteAnimation({ show, cards, onComplete }: Props) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [phase, setPhase] = useState<"fly-in" | "landed">("fly-in");
  const [exiting, setExiting] = useState(false);
  const [pastedIds, setPastedIds] = useState<Set<string>>(new Set());
  const [showAlbum, setShowAlbum] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex = Math.min(visibleIndex, cards.length - 1);
  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length - 1;
  const allDone = visibleIndex >= cards.length && phase === "landed";

  useEffect(() => {
    if (!show || cards.length === 0) { onComplete(); return; }
    setVisibleIndex(0);
    setPastedIds(new Set());
    setPhase("fly-in");
    setShowAlbum(true);
    setExiting(false);
  }, [show, cards, onComplete]);

  useEffect(() => {
    if (phase === "fly-in") {
      timerRef.current = setTimeout(() => {
        setPhase("landed");
        setPastedIds((prev) => new Set(prev).add(cards[currentIndex]?.id ?? ""));
        timerRef.current = setTimeout(() => {
          if (isLastCard) {
            setVisibleIndex((v) => v + 1);
            setPhase("fly-in");
          } else {
            setVisibleIndex((v) => v + 1);
            setPhase("fly-in");
          }
        }, 500);
      }, 800);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, currentIndex, isLastCard, cards]);

  const handleSkip = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 300);
  };

  if (!show || cards.length === 0) return null;

  const currentTeam = currentCard ? TEAMS[currentCard.teamId] : null;
  const albumSlots = currentTeam ? getAlbumSlots(currentCard.teamId) : [];
  const teamCards = cards.filter((c) => c.teamId === currentCard?.teamId);
  const pastedTeamIds = teamCards.filter((c) => pastedIds.has(c.id)).map((c) => c.id);
  const allPastedCards = cards.filter((c) => pastedIds.has(c.id));

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={handleSkip}
    >
      {/* Counter */}
      <div className="shrink-0 py-5 text-center">
        {allDone ? (
          <span className="text-[var(--color-success)] text-sm font-medium">
            <Check size={16} className="inline mr-1" /> ¡{cards.length} {cards.length === 1 ? "pegada" : "pegadas"}!
          </span>
        ) : (
          <span className="text-white/50 text-sm font-medium">
            {pastedIds.size} de {cards.length} pegadas
          </span>
        )}
      </div>

      {/* Center: current card + album page */}
      <div className="flex-1 flex flex-col items-center gap-4 overflow-y-auto px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {/* Flying card area */}
        <div className="shrink-0 h-[180px] flex items-center justify-center">
          {currentCard && phase === "fly-in" && !exiting && !allDone && (
            <div className="flex flex-col items-center gap-2 animate-sticker-paste">
              <div className="w-[120px] aspect-[3/4] rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl" style={{ background: `url('/card-bg.png') center/cover, ${currentCard.gradient}`, backgroundBlendMode: "overlay" }}>
                <div className="w-full h-[50%] flex items-end justify-center">
                  {currentCard.faceUrl ? (
                    <img src={currentCard.faceUrl} alt={currentCard.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                  ) : currentCard.num ? (
                    <span className="text-2xl font-extrabold text-white/20">{currentCard.num}</span>
                  ) : null}
                </div>
                <div className="bg-white/95 p-1.5 text-center flex-1 flex flex-col justify-center">
                  {currentTeam?.flag && <span className="text-xs block leading-none mb-0.5">{currentTeam.flag}</span>}
                  <span className="text-[9px] font-bold leading-tight">{currentCard.name}</span>
                  {currentCard.num && <span className="text-[7px] text-[var(--color-muted)]">#{currentCard.num}</span>}
                </div>
              </div>
              <div className="animate-paste-badge">
                <span className="bg-[var(--color-success)] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">¡PEGADA!</span>
              </div>
            </div>
          )}
        </div>

        {/* Album page */}
        {showAlbum && currentTeam && (
          <div
            className="w-full max-w-[400px] rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl"
            style={{
              background: currentTeam.color
                ? `linear-gradient(135deg, ${currentTeam.color}aa 0%, ${currentTeam.color} 50%, ${currentTeam.colorDark} 100%)`
                : "oklch(60% 0.1 250)",
            }}
          >
            {/* Album page header */}
            <div className="px-4 py-3 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentTeam.flag}</span>
                <span className="font-[var(--font-display)] text-sm font-bold text-white">{currentTeam.name}</span>
              </div>
              <span className="text-white/40 text-xs font-medium">{albumSlots.length} stickers</span>
            </div>

            {/* Album grid */}
            <div className="p-3">
              <div className="grid grid-cols-4 gap-2 max-sm:gap-1.5">
                {albumSlots.map((slot) => {
                  const isPasted = pastedTeamIds.includes(slot.id);
                  const isTarget = currentCard?.id === slot.id && phase === "landed";
                  const pastedCard = allPastedCards.find((c) => c.id === slot.id);
                  const team = TEAMS[currentCard?.teamId ?? ""];

                  return (
                    <div
                      key={slot.id}
                      className={`aspect-[3/4] rounded-md relative overflow-hidden transition-all duration-500 ${
                        isTarget ? "ring-2 ring-[var(--color-success)] ring-offset-1 ring-offset-black/20 scale-110 z-10" : ""
                      } ${
                        isPasted ? "scale-100 opacity-100" : "scale-95 opacity-60"
                      }`}
                      style={{
                        background: pastedCard && isPasted
                          ? `url('/card-bg.png') center/cover, ${pastedCard.gradient}`
                          : `url('/card-bg.png') center/cover, ${currentTeam.color}88`,
                        backgroundBlendMode: "overlay",
                      }}
                    >
                      {isPasted && pastedCard ? (
                        <>
                          <div className="w-full h-[55%] flex items-end justify-center">
                            {pastedCard.faceUrl ? (
                              <img src={pastedCard.faceUrl} alt={pastedCard.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xl font-extrabold text-white/20">{pastedCard.num}</span>
                            )}
                          </div>
                          <div className="bg-white/90 p-1 text-center flex-1 flex flex-col justify-center">
                            <span className="text-[7px] font-bold leading-tight">{pastedCard.name}</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-extrabold text-white/20 font-[var(--font-display)]">{slot.num}</span>
                        </div>
                      )}

                      {/* Slot number badge */}
                      <span className="absolute top-0.5 right-0.5 bg-black/30 text-white/50 text-[8px] font-bold px-1 rounded-sm">{slot.num}</span>

                      {/* Newly pasted glow */}
                      {isTarget && (
                        <div className="absolute inset-0 bg-[var(--color-success)]/20 animate-pulse pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Other teams indicator */}
        {(() => {
          const otherTeams = cards.filter((c) => c.teamId !== currentCard?.teamId && pastedIds.has(c.id));
          if (otherTeams.length === 0) return null;
          return (
            <p className="text-white/30 text-xs">
              +{otherTeams.length} en otras {new Set(otherTeams.map((c) => c.teamId)).size} selecciones
            </p>
          );
        })()}
      </div>

      {/* Skip hint */}
      <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/15">
        Tocá para saltar
      </p>
    </div>
  );
}
