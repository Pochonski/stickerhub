"use client";
import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlbumSpread } from "@/components/album/AlbumSpread";
import { StickerSlot } from "@/components/album/StickerSlot";
import { useGame } from "@/context/GameContext";
import { getTeam } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import type { CardType } from "@/data/types";
import { ArrowLeft } from "lucide-react";

const SPECIAL_PLAYERS = new Set(["arg4", "por5", "fra1", "bra2", "cro2", "eng1", "esp1", "mar1", "esp3", "eng2", "col1", "uru1", "ned1", "ger1"]);

export default function TeamAlbumPage({ params }: { params: Promise<{ team: string }> }) {
  const { team } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "jugadores") as CardType;
  const { isCollected } = useGame();

  const teamData = getTeam(team);
  if (!teamData) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-[var(--color-muted)] mb-4">Equipo no encontrado.</p>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] bg-transparent border-none cursor-pointer hover:text-[var(--color-accent)] transition-colors">
            <ArrowLeft size={14} /> Volver
          </button>
        </div>
      </AppShell>
    );
  }

  interface CardSlot {
    id: string;
    name: string;
    collected: boolean;
    num?: number;
    pos?: string;
    gradient: string;
    isSpecial?: boolean;
    faceUrl?: string;
  }

  let cardList: CardSlot[];
  let sectionLabel = "";
  let sectionSub = "";

  if (type === "jugadores" && PLAYERS[team]) {
    cardList = PLAYERS[team].map((p) => ({
      id: p.id,
      name: p.name,
      collected: isCollected(p.id),
      num: p.num,
      pos: p.pos,
      gradient: `linear-gradient(180deg, ${teamData.color} 0%, ${teamData.colorDark} 100%)`,
      isSpecial: SPECIAL_PLAYERS.has(p.id),
      faceUrl: p.faceUrl,
    }));
    sectionLabel = "Jugadores";
    sectionSub = "Selección Nacional";
  } else {
    cardList = [];
  }

  const total = cardList.length;
  const collectedCount = cardList.filter((c: { collected: boolean }) => c.collected).length;
  const pct = total > 0 ? Math.round((collectedCount / total) * 100) : 0;
  const isComplete = pct === 100;

  const leftPage = (
    <div className="flex flex-col h-full justify-between min-h-[300px]">
      <div>
        {/* Team crest */}
        <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6 max-sm:flex-col max-sm:items-start max-sm:text-center max-sm:w-full">
          <div
            className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] rounded-xl grid place-items-center text-[32px] md:text-[40px] shrink-0 shadow-sm max-sm:self-center"
            style={{
              background: `linear-gradient(135deg, ${teamData.color}, ${teamData.colorDark})`,
            }}
          >
            {teamData.flag}
          </div>
          <div className="max-sm:text-center max-sm:self-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1 font-semibold">
              {sectionSub}
            </p>
            <h1 className="font-[var(--font-display)] text-[24px] md:text-[30px] font-extrabold tracking-tight leading-tight">
              {teamData.name}
            </h1>
          </div>
        </div>

        {/* Progress ring */}
        <div className="bg-white/30 backdrop-blur-[2px] rounded-xl p-4 md:p-5 mb-6">
          <div className="flex items-center gap-3 md:gap-4 max-sm:flex-col max-sm:text-center">
            <div
              className="relative w-[60px] h-[60px] md:w-[72px] md:h-[72px] shrink-0"
              style={{
                background: `conic-gradient(${isComplete ? "var(--color-success)" : "var(--color-accent)"} ${pct}%, var(--color-border) ${pct}%)`,
                borderRadius: "50%",
              }}
            >
              <div className="absolute inset-[5px] md:inset-[6px] rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                <span className="font-[var(--font-display)] text-lg md:text-xl font-extrabold text-[var(--color-fg)]">{pct}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1 max-sm:justify-center">
                <span className="font-[var(--font-display)] text-[22px] md:text-[28px] font-extrabold text-[var(--color-accent)]">
                  {collectedCount}
                </span>
                <span className="text-sm text-[var(--color-muted)]">de {total} stickers</span>
              </div>
              <ProgressBar pct={pct} color={isComplete ? "var(--color-success)" : undefined} />
              {isComplete && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[var(--color-success)] uppercase tracking-wider">
                  Colección completa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Team stats */}
        {type === "jugadores" && (
          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              value={PLAYERS[team]?.filter((p) => isCollected(p.id)).length ?? 0}
              total={PLAYERS[team]?.length ?? 0}
              label="Jugadores"
            />
            <MiniStat
              value={cardList.filter((c) => c.collected && c.isSpecial).length}
              total={cardList.filter((c) => c.isSpecial).length}
              label="Estrellas"
            />
          </div>
        )}
      </div>
    </div>
  );

  const rightPage = (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-[var(--font-display)] text-[20px] font-bold tracking-tight">
            {sectionLabel}
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            {collectedCount} de {total} stickers · {pct}% completado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3">
        {cardList.map((card, i) => (
          <StickerSlot
            key={card.id}
            id={card.id}
            collected={card.collected}
            name={card.name}
            num={card.num}
            pos={card.pos}
            gradient={card.gradient}
            albumNumber={i + 1}
            teamName={type === "jugadores" ? teamData.name : undefined}
            isSpecial={card.isSpecial}
            faceUrl={card.faceUrl}
            flag={type === "jugadores" ? teamData.flag : undefined}
          />
        ))}
      </div>
    </div>
  );

  return (
    <AppShell>
      {/* Navigation breadcrumb */}
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] bg-transparent border-none cursor-pointer hover:text-[var(--color-accent)] transition-colors mb-6">
        <ArrowLeft size={14} /> Volver
      </button>

      {/* Album spread */}
      <div className="mb-12">
        <AlbumSpread
          leftPage={leftPage}
          rightPage={rightPage}
          leftPageNumber={1}
          rightPageNumber={2}
        />
      </div>
    </AppShell>
  );
}

function MiniStat({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <div className="bg-white/30 backdrop-blur-[2px] rounded-lg p-3">
      <div className="flex items-baseline gap-1.5 mb-0.5">
        <span className="font-[var(--font-display)] text-lg font-extrabold text-[var(--color-fg)]">
          {value}/{total}
        </span>
      </div>
      <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">{label}</span>
    </div>
  );
}
