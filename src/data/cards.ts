import type { CardItem } from "./types";

export const STADIUM_CARDS: Record<string, CardItem[]> = {
  lusail: [
    { id: "lus1", name: "Vista exterior", collected: false, bg: "linear-gradient(180deg, oklch(75% 0.04 60), oklch(50% 0.05 60))", teamId: "lusail", type: "stadium" },
    { id: "lus2", name: "Interior del estadio", collected: false, bg: "linear-gradient(180deg, oklch(70% 0.04 60), oklch(45% 0.05 60))", teamId: "lusail", type: "stadium" },
    { id: "lus3", name: "Ceremonia inaugural", collected: false, bg: "linear-gradient(180deg, oklch(65% 0.04 60), oklch(40% 0.05 60))", teamId: "lusail", type: "stadium" },
  ],
  azteca: [
    { id: "azt1", name: "Vista exterior", collected: false, bg: "linear-gradient(180deg, oklch(75% 0.04 210), oklch(50% 0.05 210))", teamId: "azteca", type: "stadium" },
    { id: "azt2", name: "Interior del estadio", collected: false, bg: "linear-gradient(180deg, oklch(70% 0.04 210), oklch(45% 0.05 210))", teamId: "azteca", type: "stadium" },
    { id: "azt3", name: "Historia del estadio", collected: false, bg: "linear-gradient(180deg, oklch(65% 0.04 210), oklch(40% 0.05 210))", teamId: "azteca", type: "stadium" },
  ],
  maracana: [
    { id: "mac1", name: "Vista exterior", collected: false, bg: "linear-gradient(180deg, oklch(75% 0.04 130), oklch(50% 0.05 130))", teamId: "maracana", type: "stadium" },
    { id: "mac2", name: "Interior del estadio", collected: false, bg: "linear-gradient(180deg, oklch(70% 0.04 130), oklch(45% 0.05 130))", teamId: "maracana", type: "stadium" },
    { id: "mac3", name: "Momentos históricos", collected: false, bg: "linear-gradient(180deg, oklch(65% 0.04 130), oklch(40% 0.05 130))", teamId: "maracana", type: "stadium" },
  ],
  wembley: [
    { id: "wem1", name: "Vista exterior", collected: false, bg: "linear-gradient(180deg, oklch(75% 0.04 35), oklch(50% 0.05 35))", teamId: "wembley", type: "stadium" },
    { id: "wem2", name: "Interior del estadio", collected: false, bg: "linear-gradient(180deg, oklch(70% 0.04 35), oklch(45% 0.05 35))", teamId: "wembley", type: "stadium" },
    { id: "wem3", name: "Final de la Euro", collected: false, bg: "linear-gradient(180deg, oklch(65% 0.04 35), oklch(40% 0.05 35))", teamId: "wembley", type: "stadium" },
  ],
};

export const VENUE_CARDS: Record<string, CardItem[]> = {
  doha: [
    { id: "doh1", name: "Panorama urbano", collected: false, bg: "linear-gradient(180deg, oklch(80% 0.03 95), oklch(55% 0.04 95))", teamId: "doha", type: "venue" },
  ],
  cdmx: [
    { id: "cdm1", name: "Centro histórico", collected: false, bg: "linear-gradient(180deg, oklch(80% 0.03 155), oklch(55% 0.04 155))", teamId: "cdmx", type: "venue" },
  ],
  nynj: [
    { id: "nyn1", name: "Manhattan skyline", collected: false, bg: "linear-gradient(180deg, oklch(80% 0.03 355), oklch(55% 0.04 355))", teamId: "nynj", type: "venue" },
  ],
  rio: [
    { id: "rio1", name: "Panorama costero", collected: false, bg: "linear-gradient(180deg, oklch(80% 0.03 285), oklch(55% 0.04 285))", teamId: "rio", type: "venue" },
  ],
};

export const ALL_STADIUM_CARDS = Object.values(STADIUM_CARDS).flat();
export const ALL_VENUE_CARDS = Object.values(VENUE_CARDS).flat();
export const ALL_CARDS = [...ALL_STADIUM_CARDS, ...ALL_VENUE_CARDS];
