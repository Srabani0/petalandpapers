import { describe, expect, it } from "vitest";
import { analyzeShelfScene, emptyDoc, makeImage, makePhoto, makeShape, makeText, type DesignDoc } from "@/lib/studio/doc";
import { buildStarter } from "@/lib/studio/starters";

const SRC = "/studio/stickers/trophy.svg";

/** 900×1200 board with one shelf whose top edge is at y = 600. */
function oneShelf(): DesignDoc {
  const doc = emptyDoc(900, 1200);
  doc.nodes = [makeShape(doc, "rect", { name: "Shelf 1", x: 30, y: 600, width: 840, height: 20, locked: true })];
  return doc;
}

describe("analyzeShelfScene", () => {
  it("an item whose bottom touches the shelf stands on it", () => {
    const doc = oneShelf();
    const frame = makePhoto(doc, { x: 100, y: 360, width: 200, height: 240 }); // bottom = 600
    doc.nodes.push(frame);
    const [g] = analyzeShelfScene(doc);
    expect(g).toMatchObject({ ids: [frame.id], shelfIndex: 0, level: 0, supportTop: 600, solid: true });
  });

  it("tolerates being a few pixels above or slightly into the shelf", () => {
    const doc = oneShelf();
    const above = makeImage(doc, SRC, { width: 100, height: 100 }, { x: 100, y: 494, width: 100, height: 100 }); // 6px gap
    const into = makeImage(doc, SRC, { width: 100, height: 100 }, { x: 400, y: 505, width: 100, height: 100 }); // 5px in
    doc.nodes.push(above, into);
    expect(analyzeShelfScene(doc).map((g) => g.ids[0]).sort()).toEqual([above.id, into.id].sort());
  });

  it("things on the wall stay on the wall", () => {
    const doc = oneShelf();
    const clock = makeImage(doc, SRC, { width: 100, height: 100 }, { x: 100, y: 200, width: 120, height: 120 });
    const offShelf = makeImage(doc, SRC, { width: 100, height: 100 }, { x: 100, y: 700, width: 100, height: 100 });
    doc.nodes.push(clock, offShelf);
    expect(analyzeShelfScene(doc)).toEqual([]);
  });

  it("needs real horizontal overlap with the shelf", () => {
    const doc = oneShelf();
    doc.nodes.push(makeImage(doc, SRC, { width: 10, height: 10 }, { x: 880, y: 500, width: 20, height: 100 }));
    expect(analyzeShelfScene(doc)).toEqual([]);
  });

  it("text drawn on a standing name plate travels with the plate", () => {
    const doc = oneShelf();
    const plate = makeShape(doc, "rect", { x: 300, y: 540, width: 300, height: 60, fill: "#b8893e" });
    const name = makeText(doc, { x: 300, y: 552, width: 300, height: 36, fontSize: 28, text: "Ms. Nahak" });
    doc.nodes.push(plate, name);
    const [g] = analyzeShelfScene(doc);
    expect(g.ids).toEqual([plate.id, name.id]);
    expect(g.solid).toBe(true);
  });

  it("an item resting on a standing item stands too (level 1)", () => {
    const doc = oneShelf();
    const books = makeImage(doc, SRC, { width: 100, height: 100 }, { x: 400, y: 500, width: 160, height: 100 });
    const smiley = makeImage(doc, SRC, { width: 100, height: 100 }, { x: 450, y: 440, width: 60, height: 60 });
    doc.nodes.push(books, smiley);
    const groups = analyzeShelfScene(doc);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.ids[0] === smiley.id)).toMatchObject({ level: 1, supportTop: 500, shelfIndex: 0 });
  });

  it("tilted items (like a slanted heading) stay flat on the wall", () => {
    const doc = oneShelf();
    doc.nodes.push(makePhoto(doc, { x: 100, y: 360, width: 200, height: 240, rotation: -8 }));
    expect(analyzeShelfScene(doc)).toEqual([]);
  });

  it("a design without shelves has nothing standing", () => {
    const doc = emptyDoc(900, 1200);
    doc.nodes.push(makePhoto(doc, { x: 0, y: 0, width: 200, height: 1200 }));
    expect(analyzeShelfScene(doc)).toEqual([]);
  });

  it("the 3-shelf starter: every photo frame and the name plate stand, the heading doesn't", () => {
    const doc = buildStarter("shelves3", 900, 1200);
    const groups = analyzeShelfScene(doc);
    const standing = new Set(groups.flatMap((g) => g.ids));
    const byName = (name: string) => doc.nodes.find((n) => n.name === name)!;

    for (const name of ["Photo 1", "Photo 2", "Photo 3", "Name plate", "Name"]) {
      expect(standing.has(byName(name).id), name).toBe(true);
    }
    expect(standing.has(byName("Heading").id)).toBe(false);
    // Each frame on its own shelf, top to bottom.
    const frameShelves = ["Photo 1", "Photo 2", "Photo 3"].map(
      (n) => groups.find((g) => g.ids[0] === byName(n).id)!.shelfIndex,
    );
    expect(frameShelves).toEqual([0, 1, 2]);
  });
});
