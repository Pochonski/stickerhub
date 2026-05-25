import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Team } from "@/data/types";

interface TeamCardProps {
  team: Team;
  collected: number;
  total: number;
  href: string;
  isPlayers?: boolean;
}

export function TeamCard({ team, collected, total, href, isPlayers = true }: TeamCardProps) {
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const isComplete = pct === 100;

  return (
    <Link
      href={href}
      className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden no-underline text-[var(--color-fg)] transition-all duration-150 hover:shadow-lg hover:border-[var(--color-accent)]/30"
    >
      <div
        className="h-20 flex items-center justify-center gap-3 text-lg font-bold tracking-tight font-[var(--font-display)]"
        style={{ background: `linear-gradient(135deg, ${team.color}, ${team.colorDark})`, color: team.accent }}
      >
        <span className="text-[32px]">{team.flag}</span>
        {team.name}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-2xl font-bold text-[var(--color-accent)] font-[var(--font-display)]">{collected}</span>
          <span className="text-xs text-[var(--color-muted)] uppercase tracking-wider">de {total}</span>
        </div>
        <ProgressBar pct={pct} color={isComplete ? "var(--color-success)" : undefined} />
        {isComplete ? (
          <span className="inline-flex mt-3 text-[11px]">
            <span className="bg-[oklch(94%_0.06_156)] text-[var(--color-success)] px-2.5 py-1 rounded-full font-semibold">✓ Completo</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-[var(--color-accent)]">
            {isPlayers ? "Ver colección" : "Ver sticker"} &rarr;
          </span>
        )}
      </div>
    </Link>
  );
}
