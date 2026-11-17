/**
 * What the 3D viewer needs to show a design: the flat "wall" print, the
 * shelves to extrude, and the cut-out items that stand on those shelves.
 * Plain data (no three.js) so the 2D canvas can produce it.
 */

export interface ShelfSpec {
  x: number; // 0–1 of design width
  y: number; // 0–1 of design height
  width: number;
  height: number;
  color: string;
}

/** A transparent cut-out of one standing group, positioned in 0–1 design units. */
export interface StandingItem3D {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 0–1 y of the surface it stands on. */
  supportTop: number;
  shelfIndex: number;
  level: 0 | 1;
  solid: boolean;
  edge: string;
}

export interface Scene3D {
  texture: string | null;
  shelves: ShelfSpec[];
  items: StandingItem3D[];
}

export const EMPTY_SCENE: Scene3D = { texture: null, shelves: [], items: [] };
