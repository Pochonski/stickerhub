interface PositionSilhouetteProps {
  pos: string;
  className?: string;
}

export function PositionSilhouette({ pos, className = "" }: PositionSilhouetteProps) {
  const key = pos?.toLowerCase() || "";
  const silhouette = SILHOUETTES[key] || SILHOUETTES.delantero;
  const colorClass = COLOR_MAP[key] || "text-white/15";

  return (
    <svg
      viewBox="0 0 120 160"
      className={`${className} ${colorClass}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {silhouette}
    </svg>
  );
}

const COLOR_MAP: Record<string, string> = {
  arquero: "text-white/20",
  defensa: "text-white/18",
  mediocampista: "text-white/18",
  delantero: "text-white/20",
};

const SILHOUETTES: Record<string, React.ReactNode> = {
  arquero: (
    <g>
      <ellipse cx="60" cy="22" rx="16" ry="18" />
      <path d="M38 62 l-10 -10 l-10 0 l-8 18 l6 8 l12 -6 l10 8 l-4 12 l8 4 l12 -8 l4 -10 l-12 -12 z" />
      <path d="M30 88 l0 28 l8 4 l8 -4 l0 -28" />
      <path d="M82 58 l12 -12 l10 4 l6 14 l-6 10 l-14 -6 l-8 8 l6 12 l-8 6 l-10 -10 l-4 -10 l10 -12 z" />
      <path d="M80 88 l0 28 l8 4 l8 -4 l0 -28" />
    </g>
  ),
  defensa: (
    <g>
      <ellipse cx="60" cy="22" rx="16" ry="18" />
      <path d="M38 62 l-6 -10 l-8 4 l-4 16 l14 8 l10 -6 l-6 -8 z" />
      <path d="M30 88 l0 28 l8 4 l8 -4 l0 -28" />
      <path d="M82 60 l8 -12 l8 6 l2 14 l-14 10 l-10 -4 l4 -10 z" />
      <path d="M80 88 l0 28 l8 4 l8 -4 l0 -28" />
      <path d="M44 50 l32 0 l0 6 l-32 0 z" />
    </g>
  ),
  mediocampista: (
    <g>
      <ellipse cx="60" cy="22" rx="16" ry="18" />
      <path d="M38 62 l-8 -14 l-10 6 l0 18 l18 8 l12 -4 l-4 -10 l-6 -4 z" />
      <path d="M30 88 l0 28 l8 4 l8 -4 l0 -28" />
      <path d="M84 60 l6 -10 l10 4 l4 14 l-16 10 l-10 -6 l2 -8 z" />
      <path d="M80 88 l0 28 l8 4 l8 -4 l0 -28" />
      <circle cx="68" cy="58" r="5" />
    </g>
  ),
  delantero: (
    <g>
      <ellipse cx="60" cy="22" rx="16" ry="18" />
      <path d="M34 62 l-6 -12 l-8 6 l0 18 l14 10 l8 -4 l-4 -10 z" />
      <path d="M22 88 l0 28 l8 4 l8 -4 l0 -28" />
      <path d="M86 60 l4 -14 l10 4 l6 14 l-14 12 l-10 -6 l2 -8 z" />
      <path d="M86 88 l0 28 l8 4 l8 -4 l0 -28" />
      <ellipse cx="82" cy="52" rx="6" ry="8" transform="rotate(-30 82 52)" />
    </g>
  ),
};
