import type { TradeOffer } from "@/core/domain/models";

export interface CreateTradeOfferDTO {
  toUserId: string;
  listingId?: string;
  requestedCardId: string;
  requestedCardName: string;
  offeredCardId: string;
  offeredCardName: string;
}

export interface TradeRepository {
  getTrades(userId: string): Promise<TradeOffer[]>;
  createTradeOffer(offer: CreateTradeOfferDTO & { fromUserId: string }): Promise<TradeOffer>;
  cancelTrade(tradeId: string, userId: string): Promise<void>;
  rejectTrade(tradeId: string, userId: string): Promise<void>;
  acceptTrade(tradeId: string, userId: string): Promise<void>;
}
