"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles } from "lucide-react";

interface TradeCelebrationProps {
  show: boolean;
  receivedCard: { name: string; faceUrl?: string; teamColor?: string; teamColorDark?: string; num?: number; pos?: string; teamName?: string; flag?: string };
  givenCard: { name: string };
  onClose: () => void;
}

const PARTICLE_COLORS = ["#FF8000", "#FBBF24", "#22C55E", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444", "#06B6D4"];
const PARTICLE_COUNT = 60;

export function TradeCelebration({ show, receivedCard, givenCard, onClose }: TradeCelebrationProps) {
  const [reveal, setReveal] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 3,
      size: 6 + Math.random() * 10,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? "circle" : "square",
    }))
  );

  useEffect(() => {
    if (!show) return;
    setReveal(false);
    const t = setTimeout(() => setReveal(true), 400);
    const close = setTimeout(onClose, 4000);
    return () => { clearTimeout(t); clearTimeout(close); };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Confetti particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.shape === "square" ? p.size : p.size,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-4 animate-[scale-in_0.5s_cubic-bezier(0.23,1,0.32,1)]">
        {/* Title */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={24} className="text-[var(--color-accent)] animate-shimmer" />
            <h2 className="font-[var(--font-display)] text-[32px] font-extrabold text-white drop-shadow-lg tracking-tight animate-pulse">
              ¡INTERCAMBIO!
            </h2>
            <Sparkles size={24} className="text-[var(--color-accent)] animate-shimmer" />
          </div>
          <p className="text-sm text-white/60 font-semibold tracking-wider">Completado con éxito</p>
        </div>

        {/* Received card */}
        <div className={`transition-all duration-700 ${reveal ? "opacity-100 scale-100" : "opacity-0 scale-75 translate-y-8"}`}>
          <div
            className="w-[180px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl relative"
            style={{
              background: receivedCard.teamColor
                ? `linear-gradient(180deg, ${receivedCard.teamColor} 0%, ${receivedCard.teamColorDark} 50%, white 50%, #f8f8f8 100%)`
                : "linear-gradient(180deg, oklch(72% 0.1 250) 0%, oklch(58% 0.12 250) 50%, white 50%, #f8f8f8 100%)",
            }}
          >
            {/* Glow */}
            <div className="absolute inset-0 animate-pulse-glow pointer-events-none" />

            {/* Photo */}
            <div className="w-full h-[55%] flex items-center justify-center relative">
              {receivedCard.faceUrl ? (
                <img src={receivedCard.faceUrl} alt={receivedCard.name} className="w-[55%] h-[70%] object-contain" referrerPolicy="no-referrer" />
              ) : receivedCard.num ? (
                <span className="text-4xl font-extrabold text-white/20">{receivedCard.num}</span>
              ) : null}
              {/* Received badge */}
              <span className="absolute top-2 left-2 bg-[var(--color-success)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">RECIBIDA</span>
            </div>

            {/* Info */}
            <div className="h-[45%] bg-white/95 p-3 flex flex-col items-center justify-center text-center">
              {receivedCard.flag && <span className="text-base leading-none mb-0.5">{receivedCard.flag}</span>}
              <span className="text-sm font-bold text-[var(--color-fg)] leading-tight">{receivedCard.name}</span>
              {receivedCard.teamName && <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider mt-0.5">{receivedCard.teamName}{receivedCard.num ? ` · #${receivedCard.num}` : ""}</span>}
            </div>
          </div>
        </div>

        {/* Given card (small) */}
        <div className="flex items-center gap-3 text-white/70 text-xs">
          <span>Entregaste:</span>
          <span className="font-semibold text-white">{givenCard.name}</span>
        </div>

        {/* Badges */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Trophy size={16} className="text-[var(--color-accent)]" />
            <span className="text-white text-sm font-bold">+1 Rep.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Star size={16} className="text-[var(--color-accent)]" />
            <span className="text-white text-sm font-bold">Transferido</span>
          </div>
        </div>

        {/* Tap to close */}
        <p className="text-[11px] text-white/30 mt-2">Tocá para cerrar</p>
      </div>
    </div>
  );
}
