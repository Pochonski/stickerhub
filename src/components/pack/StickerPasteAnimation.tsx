"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Check } from "lucide-react";
import type { PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";

interface Props {
  show: boolean;
  cards: PackCard[];
  onComplete: () => void;
}

function groupByTeam(cards: PackCard[]) {
  const groups = new Map<string, PackCard[]>();
  for (const c of cards) {
    const list = groups.get(c.teamId) ?? [];
    list.push(c);
    groups.set(c.teamId, list);
  }
  return Array.from(groups.entries());
}

export function StickerPasteAnimation({ show, cards, onComplete }: Props) {
  const [phase, setPhase] = useState<"fly-in" | "fly-down" | "done">("fly-in");
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [doneCards, setDoneCards] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex = Math.min(visibleIndex, cards.length - 1);
  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length - 1;
  const allDone = doneCards.length >= cards.length;

  // Start the sequence
  useEffect(() => {
    if (!show || cards.length === 0) {
      onComplete();
      return;
    }
    setVisibleIndex(0);
    setDoneCards([]);
    setPhase("fly-in");
    setExiting(false);
  }, [show, cards, onComplete]);

  // Auto-advance: fly-in → fly-down → next card
  useEffect(() => {
    if (phase === "fly-in") {
      timerRef.current = setTimeout(() => setPhase("fly-down"), 800);
    } else if (phase === "fly-down") {
      timerRef.current = setTimeout(() => {
        setDoneCards((prev) => [...prev, currentIndex]);
        if (isLastCard) {
          setPhase("done");
        } else {
          setVisibleIndex((v) => v + 1);
          setPhase("fly-in");
        }
      }, 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, currentIndex, isLastCard]);

  const handleSkip = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 300);
  };

  if (!show || cards.length === 0) return null;

  const currentTeam = currentCard ? TEAMS[currentCard.teamId] : null;
  const teamGroups = groupByTeam(cards.filter((_, i) => doneCards.includes(i) || i === currentIndex));

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={handleSkip}
    >
      {/* Counter */}
      <div className="shrink-0 py-6 text-center">
        {allDone ? (
          <span className="text-[var(--color-success)] text-sm font-medium">
            <Check size={16} className="inline mr-1" /> Completado · {doneCards.length} pegadas
          </span>
        ) : (
          <span className="text-white/50 text-sm font-medium">
            {doneCards.length + 1} de {cards.length} pegadas
          </span>
        )}
      </div>

      {/* Center: current card flying in */}
      <div className="shrink-0 flex items-center justify-center h-[40vh]">
        {currentCard && phase === "fly-in" && !exiting && (
          <div className="flex flex-col items-center gap-3 animate-sticker-paste">
            <div
              className="w-[160px] max-sm:w-[130px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl"
              style={{
                background: `url('/card-bg.png') center/cover, ${currentCard.gradient}`,
                backgroundBlendMode: "overlay",
              }}
            >
              <div className="w-full h-[55%] flex items-end justify-center">
                {currentCard.faceUrl ? (
                  <img src={currentCard.faceUrl} alt={currentCard.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                ) : currentCard.num ? (
                  <span className="text-3xl font-extrabold text-white/20">{currentCard.num}</span>
                ) : null}
              </div>
              <div className="bg-white/95 w-full p-2.5 text-center flex-1 flex flex-col justify-center">
                {currentTeam?.flag && <span className="text-sm block leading-none mb-0.5">{currentTeam.flag}</span>}
                <span className="text-xs font-bold leading-tight">{currentCard.name}</span>
              </div>
            </div>
            <div className="animate-paste-badge">
              <span className="bg-[var(--color-success)] text-white text-sm font-extrabold px-4 py-1.5 rounded-full shadow-lg">
                ¡PEGADA!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Album grid with pasted cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-[700px] mx-auto space-y-5">
          {teamGroups.map(([teamId, cards]) => {
            const teamData = TEAMS[teamId];
            return (
              <div key={teamId}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-base">{teamData?.flag}</span>
                  <h4 className="font-[var(--font-display)] text-xs font-semibold text-white/70">{teamData?.name ?? teamId}</h4>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {cards.map((card, i) => {
                    const isCurrent = card === currentCard && phase === "fly-down";
                    const wasJustDone = doneCards.includes(cards.indexOf(card)) && doneCards.length > 0 && doneCards[doneCards.length - 1] === cards.indexOf(card);
                    return (
                      <div
                        key={`${card.id}-${i}`}
                        className={`w-[72px] max-sm:w-[60px] aspect-[3/4] rounded-md overflow-hidden border border-white/10 shadow-lg transition-all duration-500 ${isCurrent || wasJustDone ? "opacity-100 scale-100" : "opacity-70 scale-95"}`}
                        style={{
                          background: `url('/card-bg.png') center/cover, ${card.gradient}`,
                          backgroundBlendMode: "overlay",
                        }}
                      >
                        <div className="w-full h-[50%] flex items-end justify-center">
                          {card.faceUrl ? (
                            <img src={card.faceUrl} alt={card.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                          ) : card.num ? (
                            <span className="text-lg font-extrabold text-white/15">{card.num}</span>
                          ) : null}
                        </div>
                        <div className="bg-white/90 p-1 text-center flex-1 flex flex-col justify-center">
                          <span className="text-[7px] font-bold leading-tight">{card.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip hint */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-white/15">
        Tocá para saltar
      </p>
    </div>
  );
}
