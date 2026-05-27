"use client";

import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
import type { PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import { StickerSlot } from "@/components/album/StickerSlot";

interface Props {
  show: boolean;
  cards: PackCard[];
  onComplete: () => void;
}

const SPECIAL_PLAYERS = new Set(["arg2", "arg4", "bra2", "bra3", "cro2", "egy1", "eng1", "eng2", "eng3", "esp1", "esp2", "esp3", "fra1", "fra2", "ger1", "ger2", "ger3", "col1", "mar1", "ned1", "nor1", "por1", "por5", "uru1"]);

function getAlbumSlots(teamId: string) {
  const players = PLAYERS[teamId] ?? [];
  return players
    .filter((p) => p.num > 0)
    .sort((a, b) => a.num - b.num)
    .map((p, i) => ({
      id: p.id,
      name: p.name,
      num: p.num,
      pos: p.pos,
      faceUrl: p.faceUrl,
      albumNumber: i + 1,
      isSpecial: SPECIAL_PLAYERS.has(p.id),
    }));
}

export function StickerPasteAnimation({ show, cards, onComplete }: Props) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [phase, setPhase] = useState<"fly-in" | "land">("fly-in");
  const [exiting, setExiting] = useState(false);
  const [pastedIds, setPastedIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex = Math.min(visibleIndex, cards.length - 1);
  const currentCard = cards[currentIndex];
  const allDone = pastedIds.size >= cards.length && phase === "land";

  useEffect(() => {
    if (!show || cards.length === 0) { onComplete(); return; }
    setVisibleIndex(0);
    setPastedIds(new Set());
    setPhase("fly-in");
    setExiting(false);
  }, [show, cards, onComplete]);

  useEffect(() => {
    if (exiting) return;
    if (phase === "fly-in") {
      timerRef.current = setTimeout(() => {
        if (currentCard) {
          setPastedIds((prev) => new Set(prev).add(currentCard.id));
        }
        setPhase("land");
        timerRef.current = setTimeout(() => {
          if (currentIndex >= cards.length - 1) {
            setPhase("land");
          } else {
            setVisibleIndex((v) => v + 1);
            setPhase("fly-in");
          }
        }, 600);
      }, 800);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, currentIndex, currentCard, cards, exiting]);

  const handleSkip = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 300);
  };

  if (!show || cards.length === 0) return null;

  const currentTeam = currentCard ? TEAMS[currentCard.teamId] : null;
  const albumSlots = currentTeam ? getAlbumSlots(currentCard.teamId) : [];

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

      {/* Content: card + album */}
      <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {/* Flying card */}
        <div className="shrink-0 h-[160px] flex items-center justify-center">
          {currentCard && phase === "fly-in" && !exiting && !allDone && (
            <div className="flex flex-col items-center gap-2 animate-sticker-paste">
              <div className="w-[110px] aspect-[3/4] rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl" style={{ background: `url('/card-bg.png') center/cover, ${currentCard.gradient}`, backgroundBlendMode: "overlay" }}>
                <div className="w-full h-[50%] flex items-end justify-center">
                  {currentCard.faceUrl ? (
                    <img src={currentCard.faceUrl} alt={currentCard.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xl font-extrabold text-white/20 font-[var(--font-display)]">{currentCard.num}</span>
                  )}
                </div>
                <div className="bg-white/95 p-1 text-center flex-1 flex flex-col justify-center">
                  <span className="text-[7px] font-bold leading-tight">{currentCard.name}</span>
                  {currentCard.num && <span className="text-[6px] text-[var(--color-muted)]">#{currentCard.num}</span>}
                </div>
              </div>
              <div className="animate-paste-badge">
                <span className="bg-[var(--color-success)] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">¡PEGADA!</span>
              </div>
            </div>
          )}
        </div>

        {/* Album page */}
        {currentTeam && (
          <div
            className="w-full max-w-[420px] rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl"
            style={{
              background: currentTeam.colorDark
                ? `linear-gradient(180deg, ${currentTeam.color} 0%, ${currentTeam.colorDark} 100%)`
                : "oklch(60% 0.1 250)",
            }}
          >
            {/* Page header */}
            <div className="px-4 py-2.5 bg-black/20 flex items-center gap-3">
              <span className="text-lg">{currentTeam.flag}</span>
              <div>
                <span className="font-[var(--font-display)] text-sm font-bold text-white">{currentTeam.name}</span>
                <span className="text-white/40 text-xs ml-2">{albumSlots.length} stickers</span>
              </div>
            </div>

            {/* Sticker grid — same layout as album page */}
            <div className="p-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3">
                {albumSlots.map((slot) => {
                  const isPasted = pastedIds.has(slot.id);
                  const wasJustPasted = !!(currentCard && currentCard.id === slot.id && phase === "land");

                  return (
                    <div
                      key={slot.id}
                      className={`transition-all duration-500 ${wasJustPasted ? "scale-110 ring-2 ring-[var(--color-success)] ring-offset-1 ring-offset-transparent z-10 rounded-[3px]" : "scale-100"}`}
                    >
                      <StickerSlot
                        id={slot.id}
                        collected={isPasted}
                        name={slot.name}
                        num={slot.num}
                        pos={slot.pos}
                        gradient={isPasted ? slot.name : undefined}
                        albumNumber={slot.albumNumber}
                        teamName={currentTeam.name}
                        isSpecial={slot.isSpecial}
                        faceUrl={slot.faceUrl}
                        flag={currentTeam.flag}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Other teams badge */}
        {(() => {
          const otherCount = cards.filter((c) => c.teamId !== currentCard?.teamId && pastedIds.has(c.id)).length;
          if (otherCount === 0) return null;
          const otherTeams = new Set(cards.filter((c) => c.teamId !== currentCard?.teamId && pastedIds.has(c.id)).map((c) => c.teamId));
          return (
            <p className="text-white/30 text-xs">
              +{otherCount} en {otherTeams.size} {otherTeams.size === 1 ? "selección más" : "selecciones más"}
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
