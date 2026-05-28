import type { CollectionRepository } from "../ports/collection-repository";
import type { PackRepository } from "../ports/pack-repository";
import { findNewCompletions } from "../../domain/rules/team-completion";
import type { Player } from "../../domain/models";
import { PLAYERS } from "@/data/players";

const TEAM_REWARD = 2000;

export function createCompleteTeamUseCase(
  collectionRepo: CollectionRepository,
  packRepo: PackRepository
) {
  return async (
    userId: string,
    alreadyCompleted: Set<string>
  ): Promise<string[]> => {
    const collection = await collectionRepo.getCollection(userId);
    const collected: Record<string, boolean> = {};
    for (const c of collection) {
      if (!c.is_duplicate) collected[c.card_id] = true;
    }

    const teamIds = Object.keys(PLAYERS);
    const playersByTeam = PLAYERS as Record<string, Player[]>;
    const newlyCompleted = findNewCompletions(
      teamIds,
      playersByTeam,
      collected,
      alreadyCompleted
    );

    for (let i = 0; i < newlyCompleted.length; i++) {
      await packRepo.addCoins(userId, TEAM_REWARD);
    }

    return newlyCompleted;
  };
}
