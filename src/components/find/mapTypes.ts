import type { Centre, Coords } from "../../lib/find/centres";

export type MapCentre = Centre & { km: number | null };

export type MapCanvasProps = {
  centres: MapCentre[];
  selectedId: string;
  user: Coords | null;
  onSelect: (id: string) => void;
  /** Height reserved at the bottom for the cards, so pins are not hidden behind them. */
  bottomInset: number;
  topInset: number;
};
