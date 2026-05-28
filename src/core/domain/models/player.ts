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
