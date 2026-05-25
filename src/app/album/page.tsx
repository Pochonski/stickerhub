"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs } from "@/components/ui/Tabs";
import { TeamCard } from "@/components/album/TeamCard";
import { useGame } from "@/context/GameContext";
import { TEAM_LIST, STADIUM_LIST, VENUE_LIST } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import { STADIUM_CARDS, VENUE_CARDS } from "@/data/cards";
import { PackageOpen, BookOpen } from "lucide-react";

export default function AlbumPage() {
  const { state, isCollected } = useGame();
  const [tab, setTab] = useState("jugadores");

  const totalCollected = Object.keys(state.collected).length;
  const totalPlayerCards = Object.values(PLAYERS).flat().length;
  const playerCollected = Object.values(PLAYERS).flat().filter((p) => isCollected(p.id)).length;
  const stadiumCollected = Object.values(STADIUM_CARDS).flat().filter((c) => isCollected(c.id)).length;
  const venueCollected = Object.values(VENUE_CARDS).flat().filter((c) => isCollected(c.id)).length;
  const totalAll = totalPlayerCards + Object.values(STADIUM_CARDS).flat().length + Object.values(VENUE_CARDS).flat().length;

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Álbum Mundial FIFA 2026</h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-8">Explora las selecciones, estadios y sedes. Completá tu colección abriendo sobres e intercambiando repetidas.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-9 max-sm:grid-cols-2">
        <StatCard num={totalCollected} label="Postales obtenidas" />
        <StatCard num={`${totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0}%`} label="Álbum completado" />
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
          <BookOpen size={18} strokeWidth={2} /> Ver álbum completo
        </Link>
      </div>

      <Tabs
        tabs={[
          { id: "jugadores", label: "Jugadores" },
          { id: "estadios", label: "Estadios" },
          { id: "sedes", label: "Sedes" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "jugadores" && (
        <>
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
        </>
      )}

      {tab === "estadios" && (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Estadios</h2>
            <span className="text-sm text-[var(--color-muted)]">{stadiumCollected} de {Object.values(STADIUM_CARDS).flat().length} estadios</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {STADIUM_LIST.map((stadium) => {
              const cards = STADIUM_CARDS[stadium.id] || [];
              const collected = cards.filter((c) => isCollected(c.id)).length;
              return (
                <TeamCard
                  key={stadium.id}
                  team={stadium}
                  collected={collected}
                  total={cards.length}
                  href={`/album/${stadium.id}?type=estadios`}
                  isPlayers={false}
                />
              );
            })}
          </div>
        </>
      )}

      {tab === "sedes" && (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Sedes</h2>
            <span className="text-sm text-[var(--color-muted)]">{venueCollected} de {Object.values(VENUE_CARDS).flat().length} sedes</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {VENUE_LIST.map((venue) => {
              const cards = VENUE_CARDS[venue.id] || [];
              const collected = cards.filter((c) => isCollected(c.id)).length;
              return (
                <TeamCard
                  key={venue.id}
                  team={venue}
                  collected={collected}
                  total={cards.length}
                  href={`/album/${venue.id}?type=sedes`}
                  isPlayers={false}
                />
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}

function StatCard({ num, label }: { num: number | string; label: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 text-center">
      <div className="font-[var(--font-display)] text-[28px] font-bold text-[var(--color-accent)] tracking-tight">{num}</div>
      <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
