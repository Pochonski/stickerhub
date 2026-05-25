"use client";

interface FlipCardProps {
  isFlipped: boolean;
  onFlip: () => void;
  gradient?: string;
  teamColor?: string;
  teamColorDark?: string;
  name: string;
  num?: number;
  pos?: string;
  faceUrl?: string;
  flag?: string;
}

export function FlipCard({ isFlipped, onFlip, gradient, teamColor, teamColorDark, name, num, pos, faceUrl, flag }: FlipCardProps) {
  const cardGradient = gradient || `linear-gradient(180deg, ${teamColor || "oklch(72% 0.1 250)"} 0%, ${teamColorDark || "oklch(58% 0.12 250)"} 100%)`;

  return (
    <div className="w-[130px] aspect-[3/4] [perspective:800px] max-sm:w-[100px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? `Postal de ${name}` : "Voltear postal"}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFlip(); } }}
        className={`w-full h-full relative [transform-style:preserve-3d] transition-transform duration-600 cursor-pointer ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        onClick={onFlip}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-[var(--radius-md)] flex flex-col items-center justify-center [backface-visibility:hidden] border-2 border-[oklch(62%_0.16_68)]" style={{ background: `linear-gradient(135deg,oklch(35%_0.04_260),oklch(20%_0.03_260)), url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
          <span className="text-[36px] font-extrabold text-[oklch(62%_0.16_68)] animate-shimmer font-[var(--font-display)]">?</span>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-[var(--radius-md)] overflow-hidden border-[1.5px] border-[var(--color-border)] [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-sm">
          <div className="w-full h-[60%] flex items-center justify-center relative" style={{ background: `${cardGradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
            {faceUrl ? (
              <div className="w-[66%] h-[72%] relative z-[1] flex items-center justify-center">
                <img src={faceUrl} alt={name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : num ? (
              <span className="absolute text-[64px] font-extrabold text-white/18 font-[var(--font-display)] select-none">{num}</span>
            ) : null}
          </div>
          <div className="w-full p-3 text-center bg-[var(--color-surface)] border-t border-[var(--color-border)]">
            {flag && <span className="text-lg block leading-none mb-0.5">{flag}</span>}
            <div className="text-sm font-bold text-[var(--color-fg)]">{name}</div>
            {pos && <div className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider mt-0.5">{pos}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
