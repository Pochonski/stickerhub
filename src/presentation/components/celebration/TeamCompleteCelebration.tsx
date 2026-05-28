"use client";

import { useEffect, useState } from "react";
import { Trophy, Coins, Sparkles } from "lucide-react";

interface TeamCompleteCelebrationProps {
  show: boolean;
  teamName: string;
  teamFlag: string;
  teamColor: string;
  reward: number;
  totalCompleted: number;
  onClose: () => void;
}

const PARTICLE_COLORS = ["#FF8000", "#FBBF24", "#22C55E", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444", "#06B6D4"];
const PARTICLE_COUNT = 40;

export function TeamCompleteCelebration({ show, teamName, teamFlag, teamColor, reward, totalCompleted, onClose }: TeamCompleteCelebrationProps) {
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
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
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
            height: p.size,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-5 animate-[scale-in_0.5s_cubic-bezier(0.23,1,0.32,1)]">
        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={24} className="text-[var(--color-accent)] animate-shimmer" />
            <h2 className="font-[var(--font-display)] text-[28px] font-extrabold text-white drop-shadow-lg tracking-tight">
              ¡EQUIPO COMPLETO!
            </h2>
            <Sparkles size={24} className="text-[var(--color-accent)] animate-shimmer" />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl">{teamFlag}</span>
            <span className="text-lg font-semibold text-white">{teamName}</span>
          </div>
        </div>

        {/* Team color banner */}
        <div
          className="w-[260px] h-[80px] rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}dd 100%), url('/card-bg.png') center/cover`,
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 animate-pulse-glow pointer-events-none" />
          <div className="text-center z-10">
            <div className="text-2xl mb-0.5">{teamFlag}</div>
            <span className="font-[var(--font-display)] text-xl font-extrabold text-white drop-shadow">{teamName}</span>
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center gap-2 bg-[var(--color-accent)] text-white rounded-full px-6 py-3 shadow-lg animate-[badge-pop_0.6s_ease-out]">
          <Coins size={22} />
          <span className="font-[var(--font-display)] text-xl font-extrabold">+{reward.toLocaleString()}</span>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Trophy size={16} className="text-[var(--color-accent)]" />
            <span className="text-white text-sm font-bold">{totalCompleted} de 48 equipos</span>
          </div>
        </div>

        {/* Tap to close */}
        <p className="text-[11px] text-white/30 mt-1">Tocá para cerrar</p>
      </div>
    </div>
  );
}
