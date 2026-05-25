import Link from "next/link";
import { Trophy, PackageOpen } from "lucide-react";
import type { PackCard } from "@/lib/pack-generator";

interface PackSummaryProps {
  show: boolean;
  cards: PackCard[];
  teamFlag: string;
  teamName: string;
  onOpenAnother: () => void;
}

export function PackSummary({ show, cards, teamFlag, teamName, onOpenAnother }: PackSummaryProps) {
  if (!show) return null;

  const newCards = cards.filter((c) => c.isNew);
  const repeatCards = cards.filter((c) => !c.isNew);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-7 text-center max-w-[520px] mx-auto animate-summary-in shadow-md">
      <h3 className="text-[22px] font-bold font-[var(--font-display)] mb-2 flex items-center justify-center gap-2">
        <Trophy size={24} strokeWidth={2} className="text-[var(--color-accent)]" /> ¡Sobre abierto!
      </h3>
      <p className="text-sm text-[var(--color-muted)] mb-5">
        {teamFlag} {teamName} · {newCards.length} nuevas, {repeatCards.length} repetidas
      </p>

      <div className="flex gap-3 justify-center flex-wrap mb-6">
        {cards.map((card) => (
          <div key={card.id} className="w-[72px] aspect-[3/4] rounded-lg relative overflow-hidden border border-[var(--color-border)]">
            <div className="w-full h-[55%] flex items-center justify-center" style={{ background: `${card.gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}>
              {card.faceUrl ? (
                <img src={card.faceUrl} alt={card.name} className="w-[65%] h-[60%] object-contain" referrerPolicy="no-referrer" />
              ) : card.num ? (
                <span className="text-2xl font-extrabold text-white/25 font-[var(--font-display)]">{card.num}</span>
              ) : null}
            </div>
            <div className="text-[10px] font-bold p-1.5 bg-[var(--color-surface)] text-center">{card.name}</div>
            <span
              className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md font-bold text-[9px] tracking-wide ${
                card.isNew ? "bg-[oklch(58%_0.16_156_/_0.9)] text-white" : "bg-[oklch(70%_0.14_72_/_0.9)] text-gray-900"
              }`}
            >
              {card.isNew ? "NUEVA" : "REPETIDA"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onOpenAnother}
          className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <PackageOpen size={16} strokeWidth={2} /> Abrir otro sobre
        </button>
        <Link
          href="/album"
          className="inline-flex items-center gap-2 px-[22px] py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-sm font-semibold no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Ir al álbum
        </Link>
      </div>
    </div>
  );
}
