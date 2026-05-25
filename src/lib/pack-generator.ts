import { ALL_PLAYERS } from "@/data/players";

export interface PackCard {
  id: string;
  name: string;
  num?: number;
  pos?: string;
  gradient: string;
  teamColor: string;
  teamColorDark: string;
  isNew: boolean;
  teamId: string;
  faceUrl?: string;
}

const PACK_SIZE = 6;

function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function generatePack(teamId: string, collected: Record<string, boolean>): PackCard[] {
  const players = ALL_PLAYERS.filter((p) => p.teamId === teamId);
  const selected = getRandomItems(players, Math.min(PACK_SIZE, players.length));

  return selected.map((p) => ({
    id: p.id,
    name: p.name,
    num: p.num,
    pos: p.pos,
    gradient: `linear-gradient(180deg, var(--team-color, oklch(72% 0.1 250)) 0%, var(--team-color-dark, oklch(58% 0.12 250)) 100%)`,
    teamColor: "oklch(72% 0.1 250)",
    teamColorDark: "oklch(58% 0.12 250)",
    isNew: !collected[p.id],
    teamId: p.teamId,
    faceUrl: p.faceUrl,
  }));
}

export function generateMixedPack(collected: Record<string, boolean>): PackCard[] {
  const selected = getRandomItems(ALL_PLAYERS, PACK_SIZE);

  return selected.map((p) => ({
    id: p.id,
    name: p.name,
    num: p.num,
    pos: p.pos,
    gradient: `linear-gradient(180deg, var(--team-color, oklch(72% 0.1 250)) 0%, var(--team-color-dark, oklch(58% 0.12 250)) 100%)`,
    teamColor: "oklch(72% 0.1 250)",
    teamColorDark: "oklch(58% 0.12 250)",
    isNew: !collected[p.id],
    teamId: p.teamId,
    faceUrl: p.faceUrl,
  }));
}

function makePackCard(p: typeof ALL_PLAYERS[0], collected: Record<string, boolean>): PackCard {
  return {
    id: p.id,
    name: p.name,
    num: p.num,
    pos: p.pos,
    gradient: `linear-gradient(180deg, var(--team-color, oklch(72% 0.1 250)) 0%, var(--team-color-dark, oklch(58% 0.12 250)) 100%)`,
    teamColor: "oklch(72% 0.1 250)",
    teamColorDark: "oklch(58% 0.12 250)",
    isNew: !collected[p.id],
    teamId: p.teamId,
    faceUrl: p.faceUrl,
  };
}

export function generateTeamPack(teamId: string, collected: Record<string, boolean>): PackCard[] {
  const pool = ALL_PLAYERS.filter((p) => p.teamId === teamId);
  if (pool.length < 2) return [];

  const newPlayers = pool.filter((p) => !collected[p.id]);

  const firstPool = newPlayers.length > 0 ? newPlayers : pool;
  const first = firstPool[Math.floor(Math.random() * firstPool.length)];

  const remaining = pool.filter((p) => p.id !== first.id);
  const second = remaining[Math.floor(Math.random() * remaining.length)];

  return [makePackCard(first, collected), makePackCard(second, collected)];
}
