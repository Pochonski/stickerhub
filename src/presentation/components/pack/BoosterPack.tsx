"use client";

import { useState } from "react";

interface BoosterPackProps {
  teamFlag: string;
  teamName: string;
  teamColor: string;
  teamColorDark: string;
  packsLeft: number;
  onTearComplete: () => void;
}

export function BoosterPack({
  teamFlag,
  teamName,
  teamColor,
  teamColorDark,
  packsLeft,
  onTearComplete,
}: BoosterPackProps) {
  const [stage, setStage] = useState<"idle" | "tearing" | "torn">("idle");

  const handleTear = () => {
    if (stage !== "idle") return;
    setStage("tearing");
    setTimeout(() => {
      setStage("torn");
    }, 900);
    setTimeout(() => {
      onTearComplete();
    }, 1600);
  };

  return (
    <div className="relative w-[280px] h-[360px] mx-auto max-sm:w-[220px] max-sm:h-[290px]">
      {/* Ambient glow */}
      <div
        className={`absolute -inset-8 rounded-full transition-opacity duration-700 ${
          stage === "idle" ? "opacity-60" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle, ${teamColor}20, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Bottom half — stays in place */}
      <div
        className="booster-bottom absolute left-0 right-0 bottom-0 overflow-hidden rounded-b-2xl z-[2]"
        style={{
          top: "42%",
          clipPath:
            stage === "torn"
              ? "polygon(0% 0%, 5% 3%, 10% -1%, 15% 4%, 20% -2%, 25% 5%, 30% 0%, 35% 4%, 40% -1%, 45% 5%, 50% 0%, 55% 4%, 60% -2%, 65% 3%, 70% -1%, 75% 5%, 80% 0%, 85% 4%, 90% -2%, 95% 3%, 100% 0%, 100% 100%, 0% 100%)"
              : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          transition: "clip-path 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.6s",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(180deg, ${teamColorDark} 0%, ${teamColor} 60%, ${teamColorDark} 100%)`,
          }}
        >
          {/* Foil lines */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.8) 4px, rgba(255,255,255,0.8) 5px)",
            }}
          />
        </div>
      </div>

      {/* Top half — tears off */}
      <div
        className={`booster-top absolute left-0 right-0 top-0 rounded-t-2xl z-[3] ${
          stage === "tearing" || stage === "torn"
            ? "booster-top--torn"
            : ""
        }`}
        style={{
          height: "44%",
          background: `linear-gradient(180deg, ${teamColor} 0%, ${teamColorDark} 70%, ${teamColor} 100%)`,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Foil lines */}
        <div className="absolute inset-0 rounded-t-2xl overflow-hidden opacity-[0.06]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.8) 4px, rgba(255,255,255,0.8) 5px)",
          }}
        />

        {/* Gold border */}
        <div
          className="absolute inset-2 rounded-t-xl border-2 pointer-events-none"
          style={{ borderColor: "var(--color-accent)", opacity: 0.5 }}
        />
        <div
          className="absolute inset-3 rounded-t-[10px] border pointer-events-none"
          style={{ borderColor: "var(--color-accent)", opacity: 0.25 }}
        />
      </div>

      {/* Tear line — jagged overlay */}
      <div
        className={`absolute left-0 right-0 z-[10] pointer-events-none transition-opacity duration-300 ${
          stage === "idle" ? "opacity-0" : "opacity-100"
        }`}
        style={{
          top: "42%",
          height: "8px",
          transform: "translateY(-4px)",
        }}
      >
        <svg width="100%" height="8" viewBox="0 0 280 8" preserveAspectRatio="none">
          <path
            d="M0,4 L14,0 L28,5 L42,2 L56,6 L70,1 L84,5 L98,2 L112,6 L126,1 L140,5 L154,0 L168,5 L182,2 L196,7 L210,0 L224,5 L238,2 L252,6 L266,1 L280,4"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Cards peeking out (visible after tear) */}
      <div
        className={`absolute left-[12%] right-[12%] z-[1] transition-all duration-700 ${
          stage === "torn" ? "opacity-100 -translate-y-8" : "opacity-0 translate-y-0"
        }`}
        style={{ top: "25%" }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="booster-card-peek absolute left-1/2 w-[90%] h-[54px] rounded-md border border-white/10"
            style={{
              background: `linear-gradient(180deg, ${i % 2 === 0 ? teamColor : teamColorDark} 0%, ${i % 2 === 0 ? teamColorDark : teamColor} 100%)`,
              transform: `translateX(-50%) translateY(${i * 2}px) rotate(${(i - 2.5) * 4}deg)`,
              zIndex: 5 - i,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>

      {/* Main pack body */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Abrir sobre de ${teamName}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTear();
          }
        }}
        className={`booster-body absolute inset-0 rounded-2xl overflow-hidden z-[4] transition-transform duration-300 ${
          stage === "idle" ? "cursor-pointer hover:scale-[1.02]" : ""
        }`}
        style={(() => {
          if (stage === "idle") return { animation: "booster-float 3s ease-in-out infinite" };
          if (stage === "tearing") return { animation: "booster-shake 0.3s ease-in-out" };
          if (stage === "torn") return { animation: "pack-fade-out 0.4s 0.5s cubic-bezier(0.23,1,0.32,1) forwards" };
          return undefined;
        })()}
        onClick={handleTear}
      >
        {/* Pack front design - just the image */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${teamColor} 0%, ${teamColorDark} 30%, oklch(20% 0.03 260) 50%, ${teamColorDark} 70%, ${teamColor} 100%), url('/sobre.png') center/contain no-repeat`,
            backgroundBlendMode: "overlay",
          }}
        >
          {/* Subtle foil shimmer */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 60%, transparent 70%)`,
                animation: "sticker-shine-sweep 3s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Tap prompt */}
        {stage === "idle" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/40 tracking-widest uppercase font-semibold animate-shimmer">
            Tocar para abrir
          </div>
        )}
      </div>

      {/* Packs left indicator */}
      {stage === "idle" && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-[var(--color-muted)]">
          {packsLeft} sobre{packsLeft !== 1 ? "s" : ""} disponible{packsLeft !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
