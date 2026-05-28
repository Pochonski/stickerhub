import type { TradeOffer } from "./trade-offer";

export interface GameState {
  collected: Record<string, boolean>;
  duplicates: string[];
  packs: number;
  trades: TradeOffer[];
  openedPacks: number;
}
