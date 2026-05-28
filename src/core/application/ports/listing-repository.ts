export interface ListingDTO {
  id: string;
  card_id: string;
  card_name: string;
  team_name: string;
  looking_for: string | null;
  created_at: string;
  user_id: string;
}

export interface PublishListingDTO {
  userId: string;
  cardId: string;
  cardName: string;
  teamName?: string;
  lookingFor?: string | null;
}

export interface ListingRepository {
  getActiveListings(filters: {
    search?: string;
    page?: number;
    limit?: number;
    excludeUserId?: string;
  }): Promise<ListingDTO[]>;
  publishListing(params: PublishListingDTO): Promise<ListingDTO>;
  unpublishListing(listingId: string, userId: string): Promise<void>;
  deactivateListing(listingId: string): Promise<void>;
}
