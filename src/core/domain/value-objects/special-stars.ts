export const SPECIAL_STARS = new Set([
  "arg2", "arg4", "bra2", "bra3", "cro2", "egy1",
  "eng1", "eng2", "eng3", "esp1", "esp2", "esp3",
  "fra1", "fra2", "ger1", "ger2", "ger3", "col1",
  "mar1", "ned1", "nor1", "por1", "por5", "uru1",
]);

export function isSpecialStar(cardId: string): boolean {
  return SPECIAL_STARS.has(cardId);
}
