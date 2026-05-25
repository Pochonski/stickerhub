export interface Team {
  id: string;
  name: string;
  flag: string;
  color: string;
  colorDark: string;
  accent: string;
}

export interface Player {
  id: string;
  name: string;
  num: number;
  pos: string;
  teamId: string;
  fullName?: string;
  overall?: number;
  faceUrl?: string;
}

export interface CardItem {
  id: string;
  name: string;
  collected: boolean;
  bg: string;
  teamId: string;
  type: "stadium" | "venue";
}

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

export interface GameState {
  collected: Record<string, boolean>;
  duplicates: string[];
  packs: number;
  trades: TradeOffer[];
  openedPacks: number;
}

export type CardType = "jugadores" | "estadios" | "sedes";

export interface PlayerDetail extends Player {
  height?: number;
  weight?: number;
  foot?: string;
  birthDate?: string;
  birthPlace?: string;
  bio?: string;
  age?: number;
  club?: string;
  stats?: { label: string; value: number | string }[];
  achievements?: { year: string; title: string; description: string }[];
}
