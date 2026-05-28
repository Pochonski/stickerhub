"use client";

import Link from "next/link";
import { AppShell } from "@/presentation/components/layout/AppShell";
import { TeamCard } from "@/presentation/components/album/TeamCard";
import { useGame } from "@/presentation/contexts/GameContext";
import { StatCard } from "@/presentation/components/ui/StatCard";
import { TEAM_LIST } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import { PackageOpen, BookOpen } from "lucide-react";

export default function AlbumPage() {
  const { state, isCollected } = useGame();

  const totalCollected = Object.keys(state.collected).length;
  const totalPlayerCards = Object.values(PLAYERS).flat().length;
  const playerCollected = Object.values(PLAYERS).flat().filter((p) => isCollected(p.id)).length;
  const totalAll = totalPlayerCards;

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Sticker<span className="text-[var(--color-primary)]">Hub</span> Mundial FIFA 2026</h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-8">Explora las selecciones, estadios y sedes. Completá tu colección abriendo sobres e intercambiando repetidas.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-9 max-sm:grid-cols-2">
        <StatCard num={totalCollected} label="Postales obtenidas" />
        <StatCard num={`${totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0}%`} label="Completado" />
        <StatCard num={`${state.packs}`} label="Sobres disponibles" />
        <StatCard num={`${TEAM_LIST.length}`} label="Selecciones" />
      </div>

      <div className="flex gap-3 flex-wrap mb-8">
        <Link
          href="/pack-opener"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--color-accent)] text-white text-base font-semibold no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <PackageOpen size={18} strokeWidth={2} /> Abrir sobres ({state.packs} disponibles)
        </Link>
        <Link
          href="/album/flipbook"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-[1.5px] border-[var(--color-accent)] text-[var(--color-accent)] text-base font-semibold no-underline transition-colors hover:bg-[var(--color-accent)] hover:text-white"
        >
          <BookOpen size={18} strokeWidth={2} /> Ver colección completa
        </Link>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Selecciones</h2>
        <span className="text-sm text-[var(--color-muted)]">{playerCollected} de {totalPlayerCards} jugadores</span>
      </div>
      <div className="grid grid-cols-3 gap-5 mb-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {TEAM_LIST.map((team) => {
              const players = PLAYERS[team.id] || [];
              const collected = players.filter((p) => isCollected(p.id)).length;
              return (
                <TeamCard
                  key={team.id}
                  team={team}
                  collected={collected}
                  total={players.length}
                  href={`/album/${team.id}?type=jugadores`}
                />
              );
          })}
        </div>
    </AppShell>
  );
}


