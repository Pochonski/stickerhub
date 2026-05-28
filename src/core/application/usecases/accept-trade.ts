import type { TradeRepository } from "../ports/trade-repository";
import type { CollectionRepository } from "../ports/collection-repository";
import type { ListingRepository } from "../ports/listing-repository";
import type { NotificationRepository } from "../ports/notification-repository";

export function createAcceptTradeUseCase(
  tradeRepo: TradeRepository,
  collectionRepo: CollectionRepository,
  listingRepo: ListingRepository,
  notificationRepo: NotificationRepository
) {
  return async (tradeId: string, userId: string): Promise<void> => {
    const trades = await tradeRepo.getTrades(userId);
    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) throw new Error("Trade not found");

    await tradeRepo.acceptTrade(tradeId, userId);
  };
}
