import type { TradeRepository } from "../ports/trade-repository";
import type { CollectionRepository } from "../ports/collection-repository";
import type { NotificationRepository } from "../ports/notification-repository";

export function createRequestTradeUseCase(
  tradeRepo: TradeRepository,
  collectionRepo: CollectionRepository,
  notificationRepo: NotificationRepository
) {
  return async (params: {
    fromUserId: string;
    toUserId: string;
    listingId?: string;
    requestedCardId: string;
    requestedCardName: string;
    offeredCardId: string;
    offeredCardName: string;
  }): Promise<void> => {
    const duplicates = await collectionRepo.getDuplicates(params.fromUserId);
    if (!duplicates.includes(params.offeredCardId)) {
      throw new Error("You don't own the offered card as duplicate");
    }

    await tradeRepo.createTradeOffer({
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      listingId: params.listingId,
      requestedCardId: params.requestedCardId,
      requestedCardName: params.requestedCardName,
      offeredCardId: params.offeredCardId,
      offeredCardName: params.offeredCardName,
    });

    await notificationRepo.create({
      userId: params.toUserId,
      type: "trade_request",
      title: "Nueva solicitud de intercambio",
      body: `Quieren intercambiar ${params.offeredCardName} por tu ${params.requestedCardName}`,
    });
  };
}
