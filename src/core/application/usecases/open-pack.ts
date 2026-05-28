import type { PackRepository } from "../ports/pack-repository";
import type { CollectionRepository } from "../ports/collection-repository";
import { generateMixedPack } from "../../domain/rules/pack-generator";
import type { PackCard } from "../../domain/models";

export function createOpenPackUseCase(
  packRepo: PackRepository,
  collectionRepo: CollectionRepository
) {
  return async (userId: string): Promise<PackCard[]> => {
    const quantity = await packRepo.decrementPack(userId);
    if (quantity < 0) return [];

    const collection = await collectionRepo.getCollection(userId);
    const collected: Record<string, boolean> = {};
    for (const c of collection) {
      if (!c.is_duplicate) collected[c.card_id] = true;
    }

    const cards = generateMixedPack(collected);

    for (const card of cards) {
      collectionRepo.addCard(userId, card.id, card.isNew ? "new" : "duplicate");
    }

    return cards;
  };
}
