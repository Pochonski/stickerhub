export function StatCard({ num, label }: { num: number | string; label: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 text-center">
      <div className="font-[var(--font-display)] text-[28px] font-bold text-[var(--color-accent)] tracking-tight">{num}</div>
      <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
