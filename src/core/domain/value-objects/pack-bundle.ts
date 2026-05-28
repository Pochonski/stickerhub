export interface PackBundle {
  quantity: number;
  price: number;
  label: string;
  savings: string;
}

export const PACK_BUNDLES: PackBundle[] = [
  { quantity: 1, price: 500, label: "1 sobre", savings: "" },
  { quantity: 3, price: 1350, label: "3 sobres", savings: "ahorrá 150" },
  { quantity: 5, price: 2000, label: "5 sobres", savings: "ahorrá 500" },
];
