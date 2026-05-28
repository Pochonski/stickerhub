import type { CollectionRepository } from "../ports/collection-repository";

export function createCollectCardUseCase(collectionRepo: CollectionRepository) {
  return async (userId: string, cardId: string): Promise<{ isDuplicate: boolean }> => {
    const collection = await collectionRepo.getCollection(userId);
    const alreadyCollected = collection.some(
      (c) => c.card_id === cardId && !c.is_duplicate
    );

    if (alreadyCollected) {
      await collectionRepo.addCard(userId, cardId, "duplicate");
      return { isDuplicate: true };
    }

    await collectionRepo.addCard(userId, cardId, "new");
    return { isDuplicate: false };
  };
}
