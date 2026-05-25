"use client";

import { Trophy } from "lucide-react";
import type { PackCard } from "@/lib/pack-generator";
import { TEAMS } from "@/data/teams";

interface TeamPackResultProps {
  open: boolean;
  cards: PackCard[];
  teamName: string;
  teamFlag: string;
  onClose: () => void;
}

export function TeamPackResult({ open, cards, teamName, teamFlag, onClose }: TeamPackResultProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-8 max-w-[440px] w-[92%] text-center shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-accent-soft)] grid place-items-center">
          <Trophy size={28} className="text-[var(--color-accent)]" strokeWidth={1.5} />
        </div>

        <h2 className="font-[var(--font-display)] text-[22px] font-bold mb-1">¡Sobre de Selección abierto!</h2>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          {teamFlag} {teamName}
        </p>

        <div className="flex gap-4 justify-center mb-8">
          {cards.map((card, i) => (
            <div
              key={`${card.id}-${i}`}
              className="card-cascade-item w-[130px] aspect-[3/4] rounded-[var(--radius-md)] relative overflow-hidden border-2 border-[var(--color-border)] shadow-md"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div
                className="w-full h-[55%] flex items-center justify-center"
                style={{
                  background: `linear-gradient(180deg, ${TEAMS[card.teamId]?.color ?? "oklch(72% 0.1 250)"} 0%, ${TEAMS[card.teamId]?.colorDark ?? "oklch(58% 0.12 250)"} 100%), url('/card-bg.png') center/cover`,
                  backgroundBlendMode: "overlay",
                }}
              >
                {card.faceUrl ? (
                  <img
                    src={card.faceUrl}
                    alt={card.name}
                    className="w-[68%] h-[68%] object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : card.num ? (
                  <span className="text-[28px] font-extrabold text-white/25 font-[var(--font-display)]">{card.num}</span>
                ) : null}
              </div>
              <div className="text-[11px] font-bold p-2 bg-[var(--color-surface)] text-center leading-tight">
                {teamFlag && <span className="text-[9px] block leading-none mb-0.5">{teamFlag}</span>}
                {card.name}
              </div>
              <span
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-md font-bold text-[9px] tracking-wide ${
                  card.isNew
                    ? "bg-[var(--color-success)] text-white"
                    : "bg-[var(--color-warning)] text-gray-900"
                }`}
              >
                {card.isNew ? "NUEVA" : "REPETIDA"}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
