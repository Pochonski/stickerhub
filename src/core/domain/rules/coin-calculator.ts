import { isSpecialStar } from "../value-objects/special-stars";

export function calculateCoinValue(rating: number, cardId?: string): number {
  if (cardId && isSpecialStar(cardId)) return 1300;
  if (rating >= 90) return 900;
  if (rating >= 85) return 700;
  if (rating >= 80) return 500;
  if (rating >= 75) return 300;
  return 150;
}
