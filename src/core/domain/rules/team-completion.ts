import type { Player } from "../models/player";

export function countTeamCollected(
  teamId: string,
  players: Record<string, Player[]>,
  collected: Record<string, boolean>
): number {
  const teamPlayers = players[teamId];
  if (!teamPlayers) return 0;
  return teamPlayers.filter((p) => collected[p.id]).length;
}

export function isTeamComplete(
  teamId: string,
  players: Record<string, Player[]>,
  collected: Record<string, boolean>
): boolean {
  const teamPlayers = players[teamId];
  if (!teamPlayers || teamPlayers.length === 0) return false;
  return countTeamCollected(teamId, players, collected) >= teamPlayers.length;
}

export function findNewCompletions(
  teamIds: Iterable<string>,
  playersByTeam: Record<string, Player[]>,
  collected: Record<string, boolean>,
  alreadyCompleted: Set<string>
): string[] {
  const newlyCompleted: string[] = [];
  for (const teamId of teamIds) {
    if (alreadyCompleted.has(teamId)) continue;
    if (isTeamComplete(teamId, playersByTeam, collected)) {
      newlyCompleted.push(teamId);
    }
  }
  return newlyCompleted;
}
