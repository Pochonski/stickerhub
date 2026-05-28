export interface TradeOffer {
  id: string;
  cardId: string;
  cardName: string;
  fromUser: string;
  status: "pending" | "completed" | "cancelled";
  date: string;
  offeredCardId: string;
  offeredCardName: string;
  direction: "sent" | "received";
}
