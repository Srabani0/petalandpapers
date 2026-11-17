import { describe, expect, it } from "vitest";
import { shelfCenter } from "@/components/studio/three/models";
import { detectShelves, emptyDoc } from "@/lib/studio/doc";
import { buildStarter } from "@/lib/studio/starters";

describe("3D shelf placement matches the 2D design", () => {
  const W = 1.05;
  const H = 1.4;

  it("maps the design's top edge to the top of the board and bottom to bottom", () => {
    expect(shelfCenter({ x: 0, y: 0, width: 1, height: 0 }, W, H).y).toBeCloseTo(H / 2);
    expect(shelfCenter({ x: 0, y: 1, width: 1, height: 0 }, W, H).y).toBeCloseTo(-H / 2);
    expect(shelfCenter({ x: 0, y: 0.5, width: 1, height: 0 }, W, H).y).toBeCloseTo(0);
  });

  it("centres a full-width shelf horizontally and offsets a left-aligned one", () => {
    expect(shelfCenter({ x: 0, y: 0.5, width: 1, height: 0 }, W, H).x).toBeCloseTo(0);
    expect(shelfCenter({ x: 0, y: 0.5, width: 0.5, height: 0 }, W, H).x).toBeCloseTo(-W / 4);
  });

  it("every starter shelf lands inside the board, in the same order as the design", () => {
    const doc = buildStarter("shelves3", 900, 1200);
    const ys = detectShelves(doc).map((s) => shelfCenter(s, W, H).y);
    expect(ys).toHaveLength(3);
    for (const y of ys) expect(Math.abs(y)).toBeLessThanOrEqual(H / 2);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys); // top shelf highest
  });

  it("starter shelves are locked but slide vertically", () => {
    const doc = buildStarter("shelves2", 900, 1200);
    const shelves = doc.nodes.filter((n) => n.name?.startsWith("Shelf"));
    expect(shelves.every((s) => s.locked && s.slideY)).toBe(true);
    expect(detectShelves(emptyDoc(900, 1200))).toEqual([]);
  });
});
