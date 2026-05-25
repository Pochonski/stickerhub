import { ALL_PLAYERS } from "@/data/players";
import { ALL_STADIUM_CARDS, ALL_VENUE_CARDS } from "@/data/cards";
import type { Player, CardItem } from "@/data/types";

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
  const playerCards = getRandomItems(ALL_PLAYERS, 4);
  const stadiumCards = getRandomItems(ALL_STADIUM_CARDS, 1);
  const venueCards = getRandomItems(ALL_VENUE_CARDS, 1);

  const results: PackCard[] = [
    ...playerCards.map((p) => ({
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
    })),
    ...stadiumCards.map((c) => ({
      id: c.id,
      name: c.name,
      gradient: c.bg,
      teamColor: "oklch(62% 0.06 80)",
      teamColorDark: "oklch(50% 0.06 80)",
      isNew: !collected[c.id],
      teamId: c.teamId,
    })),
    ...venueCards.map((c) => ({
      id: c.id,
      name: c.name,
      gradient: c.bg,
      teamColor: "oklch(65% 0.04 95)",
      teamColorDark: "oklch(52% 0.04 95)",
      isNew: !collected[c.id],
      teamId: c.teamId,
    })),
  ];

  return results;
}
