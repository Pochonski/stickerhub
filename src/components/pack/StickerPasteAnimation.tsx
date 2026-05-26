"use client";

import { useEffect, useState, useCallback } from "react";
import { Check } from "lucide-react";
import type { PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";

interface Props {
  show: boolean;
  cards: PackCard[];
  onComplete: () => void;
}

export function StickerPasteAnimation({ show, cards, onComplete }: Props) {
  const [visible, setVisible] = useState(0);
  const [exiting, setExiting] = useState(false);

  const advance = useCallback(() => {
    setVisible((v) => {
      if (v >= cards.length) return v;
      return v + 1;
    });
  }, [cards.length]);

  // Animate cards one by one
  useEffect(() => {
    if (!show || cards.length === 0) {
      onComplete();
      return;
    }
    setVisible(1);
    setExiting(false);
  }, [show, cards, onComplete]);

  useEffect(() => {
    if (visible >= cards.length || !show) return;
    const t = setTimeout(advance, 600);
    return () => clearTimeout(t);
  }, [visible, cards.length, show, advance]);

  const handleSkip = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 300);
  };

  if (!show || cards.length === 0) return null;

  const currentCard = cards[Math.min(visible - 1, cards.length - 1)];
  const team = currentCard ? TEAMS[currentCard.teamId] : null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleSkip}
    >
      {/* Counter */}
      <div className="absolute top-8 left-0 right-0 text-center text-white/50 text-sm font-medium">
        {visible > cards.length ? (
          <span className="text-[var(--color-success)]"><Check size={16} className="inline mr-1" /> Completado</span>
        ) : (
          <>{Math.min(visible, cards.length)} de {cards.length} pegadas</>
        )}
      </div>

      {/* Cards being pasted (animated) */}
      <div className="relative flex items-center justify-center">
        {/* Pasted stack (already done cards, behind) */}
        <div className="absolute bottom-[-80px] flex items-end gap-[-30px]">
          {cards.slice(0, visible - 1).map((card, i) => (
            <div
              key={`done-${card.id}-${i}`}
              className="w-[60px] max-sm:w-[48px] aspect-[3/4] rounded-md overflow-hidden border border-[var(--color-border)] shadow-md opacity-80"
              style={{
                transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 4}deg) translateY(${i * 2}px)`,
                background: card.gradient,
                backgroundBlendMode: "overlay",
              }}
            >
              <div className="w-full h-full flex items-center justify-center" style={{ background: `url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                {card.faceUrl ? (
                  <img src={card.faceUrl} alt={card.name} className="w-[60%] object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xs font-extrabold text-white/20">{card.num}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current card being pasted */}
        {currentCard && !exiting && (
          <div className="flex flex-col items-center gap-3 animate-sticker-paste">
            <div
              className="w-[180px] max-sm:w-[140px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl relative"
              style={{
                background: currentCard.gradient,
                backgroundBlendMode: "overlay",
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: `url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
                <div className="w-full h-[55%] flex items-end justify-center">
                  {currentCard.faceUrl ? (
                    <img src={currentCard.faceUrl} alt={currentCard.name} className="w-[55%] object-contain" referrerPolicy="no-referrer" />
                  ) : currentCard.num ? (
                    <span className="text-4xl font-extrabold text-white/20">{currentCard.num}</span>
                  ) : null}
                </div>
                <div className="bg-white/95 w-full p-3 text-center flex-1 flex flex-col justify-center">
                  {team?.flag && <span className="text-base block leading-none mb-0.5">{team.flag}</span>}
                  <span className="text-sm font-bold leading-tight">{currentCard.name}</span>
                  {currentCard.pos && currentCard.num && (
                    <span className="text-[9px] text-[var(--color-muted)] uppercase mt-0.5">{currentCard.pos} · #{currentCard.num}</span>
                  )}
                </div>
              </div>
            </div>

            {/* PEGADA badge */}
            <div className="animate-paste-badge">
              <span className="bg-[var(--color-success)] text-white text-sm font-extrabold px-4 py-1.5 rounded-full shadow-lg">
                ¡PEGADA!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Skip hint */}
      <p className="absolute bottom-8 text-[11px] text-white/20">
        Tocá para saltar
      </p>
    </div>
  );
}
