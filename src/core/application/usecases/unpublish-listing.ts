import type { ListingRepository } from "../ports/listing-repository";

export function createUnpublishListingUseCase(listingRepo: ListingRepository) {
  return async (listingId: string, userId: string): Promise<void> => {
    await listingRepo.unpublishListing(listingId, userId);
  };
}
