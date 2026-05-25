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

const PACK_SIZE = 7;

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
  const allCards = [...ALL_PLAYERS, ...ALL_STADIUM_CARDS, ...ALL_VENUE_CARDS];
  const selected = getRandomItems(allCards, PACK_SIZE);

  return selected.map((item) => {
    if ("num" in item) {
      const p = item as Player;
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
    const c = item as CardItem;
    return {
      id: c.id,
      name: c.name,
      gradient: c.bg,
      teamColor: c.type === "stadium" ? "oklch(62% 0.06 80)" : "oklch(65% 0.04 95)",
      teamColorDark: c.type === "stadium" ? "oklch(50% 0.06 80)" : "oklch(52% 0.04 95)",
      isNew: !collected[c.id],
      teamId: c.teamId,
    };
  });
}
