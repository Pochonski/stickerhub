"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Pill } from "@/components/ui/Pill";
import { useGame } from "@/context/GameContext";
import { ALL_PLAYERS, PLAYER_DETAILS } from "@/data/players";
import { TEAMS } from "@/data/teams";
import type { PlayerDetail, Player, Team } from "@/data/types";

interface CardInfo {
  name: string;
  num: number;
  pos: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  teamColorDark: string;
  type: "jugador" | "estadio" | "sede";
  bg?: string;
  player?: PlayerDetail;
  isDetailed: boolean;
}

function resolveTeam(teamId: string): Team | undefined {
  return TEAMS[teamId];
}

function getCardInfo(id: string): CardInfo | null {
  // Check player details (top 3 per team)
  const detailed = PLAYER_DETAILS[id];
  if (detailed) {
    const team = resolveTeam(detailed.teamId);
    return {
      name: detailed.name,
      num: detailed.num,
      pos: detailed.pos,
      teamId: detailed.teamId,
      teamName: team?.name || detailed.teamId,
      teamColor: team?.color || "oklch(72% 0.1 250)",
      teamColorDark: team?.colorDark || "oklch(58% 0.12 250)",
      type: "jugador",
      player: detailed,
      isDetailed: true,
    };
  }

  // Check all players
  const player = ALL_PLAYERS.find((p) => p.id === id);
  if (player) {
    const team = resolveTeam(player.teamId);
    return {
      name: player.name,
      num: player.num,
      pos: player.pos,
      teamId: player.teamId,
      teamName: team?.name || player.teamId,
      teamColor: team?.color || "oklch(72% 0.1 250)",
      teamColorDark: team?.colorDark || "oklch(58% 0.12 250)",
      type: "jugador",
      player: player as PlayerDetail,
      isDetailed: false,
    };
  }

  return null;
}

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isCollected, collectCard } = useGame();
  const info = getCardInfo(id);

  if (!info) {
    return (
      <AppShell>
        <p className="text-center py-16 text-[var(--color-muted)]">Postal no encontrada.</p>
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] bg-transparent border-none cursor-pointer hover:text-[var(--color-accent)] transition-colors">&larr; Volver</button>
      </AppShell>
    );
  }

  const { name, num, pos, teamName, teamColor, teamColorDark, type, bg, player, isDetailed } = info;
  const collected = isCollected(id);
  const gradient = bg || `linear-gradient(180deg, ${teamColor} 0%, ${teamColorDark} 45%, oklch(97% 0.02 ${teamColorDark.includes("250") ? "250" : "5"}) 45%, oklch(92% 0.03 ${teamColorDark.includes("250") ? "250" : "5"}) 100%)`;

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] bg-transparent border-none cursor-pointer hover:text-[var(--color-accent)] transition-colors mb-6">
        &larr; Volver
      </button>

      <div className="grid grid-cols-[340px_1fr] gap-10 mb-12 max-lg:grid-cols-1 max-lg:max-w-[340px]">
        {/* Card visual */}
        <div
          className="aspect-[3/4] rounded-[var(--radius-lg)] overflow-hidden flex flex-col relative shadow-lg"
          style={{ background: `${gradient}, url('/card-bg.png') center/cover`, backgroundBlendMode: "overlay" }}
        >
          <div className="flex-1 flex items-center justify-center relative">
            {type === "jugador" && player?.faceUrl ? (
              <div className="w-[72%] h-[72%] relative flex items-center justify-center">
                <img
                  src={player.faceUrl}
                  alt={player.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="text-center">
                <span className="font-[var(--font-display)] font-extrabold text-[40px] text-white/80 text-center tracking-tight drop-shadow-md block">
                  {name.split(" ").pop()?.toUpperCase()}
                </span>
                <span className="text-sm text-white/50 font-semibold uppercase tracking-[0.12em] mt-2 block">
                  {type === "estadio" ? "ESTADIO" : type === "sede" ? "SEDE" : ""}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white/95 px-4 py-3 text-center border-t border-[var(--color-border)]">
            <span className="font-[var(--font-display)] font-extrabold text-3xl text-[var(--color-fg)] tracking-tight block leading-none">
              {name}
            </span>
            <span className="text-[11px] text-[var(--color-muted)] uppercase tracking-[0.15em] font-semibold mt-0.5 block">
              {teamName}{type === "jugador" && num > 0 ? ` · #${num}` : ""}
            </span>
          </div>
        </div>

        {/* Card info */}
        <div>
          <h1 className="font-[var(--font-display)] text-[36px] font-bold tracking-tight">{name}</h1>
          <p className="text-lg text-[var(--color-muted)] mt-1 mb-4">
            {type === "jugador" ? `${pos} · ${teamName}${num > 0 ? ` · #${num}` : ""}` : `${pos} · ${teamName}`}
          </p>

          {type === "jugador" && isDetailed && player && "height" in player && (
            <>
              <div className="flex gap-5 flex-wrap mb-6">
                <MetaItem val={`${player.height} cm`} label="Estatura" />
                <MetaItem val={`${player.weight} kg`} label="Peso" />
                <MetaItem val={player.foot!} label="Perfil" />
                <MetaItem val={player.birthDate!} label="Nacimiento" />
                <MetaItem val={player.birthPlace!} label="Ciudad natal" />
                {player.club && <MetaItem val={player.club} label="Club" />}
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-8">
                <h3 className="text-lg font-bold font-[var(--font-display)] mb-3">Biografía</h3>
                <p className="text-[15px] leading-relaxed">{player.bio}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2">
                {player.stats?.map((s, i) => (
                  <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 text-center">
                    <div className="font-[var(--font-display)] text-[28px] font-bold text-[var(--color-accent)] tracking-tight">{s.value}</div>
                    <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(type === "estadio" || type === "sede") && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-8">
              <h3 className="text-lg font-bold font-[var(--font-display)] mb-3">
                {type === "estadio" ? "Estadio Mundialista" : "Ciudad Anfitriona"}
              </h3>
              <p className="text-[15px] leading-relaxed">
                {type === "estadio"
                  ? `${name} es uno de los estadios oficiales de la Copa Mundial FIFA 2026. Este recinto deportivo albergará partidos de la fase de grupos, eliminatorias y posiblemente una semifinal o la gran final del torneo más importante del fútbol mundial.`
                  : `${name} es una de las ciudades sede del Mundial FIFA 2026. Como anfitriona, recibirá a miles de aficionados de todo el mundo que vivirán la emoción del fútbol en sus calles, estadios y fan zones oficiales.`}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6 max-sm:flex-col">
            <button
              onClick={() => collectCard(id)}
              className="px-7 py-3.5 rounded-full bg-[var(--color-accent)] text-white text-base font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {collected ? "Ya en tu colección" : "Agregar a colección"}
            </button>
          </div>
        </div>
      </div>

      {isDetailed && player?.achievements && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-bold font-[var(--font-display)] tracking-tight">Logros destacados</h2>
          </div>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            {player.achievements!.map((a, i) => (
              <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
                <Pill variant="accent" className="mb-3">{a.year}</Pill>
                <h3 className="text-base font-bold font-[var(--font-display)] mb-2">{a.title}</h3>
                <p className="text-sm text-[var(--color-muted)]">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function MetaItem({ val, label }: { val: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-3 px-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
      <span className="font-[var(--font-display)] text-xl font-bold text-[var(--color-accent)]">{val}</span>
      <span className="text-[11px] text-[var(--color-muted)] uppercase tracking-widest">{label}</span>
    </div>
  );
}
