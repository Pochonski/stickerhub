export function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color || "linear-gradient(90deg, var(--color-accent), oklch(68% 0.16 68))",
        }}
      />
    </div>
  );
}
