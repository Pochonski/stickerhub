import type { ListingRepository } from "../ports/listing-repository";
import type { CollectionRepository } from "../ports/collection-repository";

export function createPublishListingUseCase(
  listingRepo: ListingRepository,
  collectionRepo: CollectionRepository
) {
  return async (params: {
    userId: string;
    cardId: string;
    cardName: string;
    teamName: string;
    lookingFor: string | null;
  }): Promise<{ id: string }> => {
    const duplicates = await collectionRepo.getDuplicates(params.userId);
    if (!duplicates.includes(params.cardId)) {
      throw new Error("You don't own this card as a duplicate");
    }

    const listing = await listingRepo.publishListing(params);
    return listing;
  };
}
