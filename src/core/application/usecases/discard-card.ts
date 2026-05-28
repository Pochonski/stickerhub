import type { CollectionRepository } from "../ports/collection-repository";
import type { PackRepository } from "../ports/pack-repository";
import { calculateCoinValue } from "../../domain/rules/coin-calculator";

export function createDiscardCardUseCase(
  collectionRepo: CollectionRepository,
  packRepo: PackRepository
) {
  return async (userId: string, cardId: string, rating: number): Promise<number> => {
    const duplicates = await collectionRepo.getDuplicates(userId);
    if (!duplicates.includes(cardId)) {
      throw new Error("Card is not a duplicate");
    }

    await collectionRepo.removeDuplicate(userId, cardId);

    const value = calculateCoinValue(rating, cardId);
    await packRepo.addCoins(userId, value);

    return value;
  };
}
