export interface CardItem {
  id: string;
  name: string;
  collected: boolean;
  bg: string;
  teamId: string;
  type: "stadium" | "venue";
}
