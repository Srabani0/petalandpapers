import { describe, expect, it } from "vitest";
import { SIZE_PRESETS, parseDesignDoc } from "@/lib/studio/doc";
import { buildStarter } from "@/lib/studio/starters";
import { FLORAL_STARTERS } from "@/lib/studio/floral-starters";
import { CHENILLE } from "@/lib/studio/chenille-assets";

const FRAME_SIZES = SIZE_PRESETS.filter((p) => ["6x8", "8x10", "12x16"].includes(p.key));

describe("pipe-cleaner floral frames", () => {
  for (const key of FLORAL_STARTERS) {
    for (const size of FRAME_SIZES) {
      it(`${key} at ${size.key} is a valid, editable design`, () => {
        const doc = buildStarter(key, size.width, size.height);
        expect("doc" in parseDesignDoc(doc)).toBe(true);

        const border = doc.nodes.find((n) => n.name === "Fuzzy border");
        expect(border).toMatchObject({ type: "image", locked: true, x: 0, y: 0, width: size.width, height: size.height });

        expect(doc.nodes.some((n) => n.type === "photo")).toBe(true);
        const flowers = doc.nodes.filter((n) => n.type === "image" && n !== border);
        expect(flowers.length).toBeGreaterThan(4);
        // Only the border is locked — every flower can be moved, resized or removed.
        expect(flowers.every((n) => !n.locked)).toBe(true);
      });
    }
  }

  it("only references pieces that exist", () => {
    const srcs = new Set(Object.values(CHENILLE).map((a) => a.src));
    for (const key of FLORAL_STARTERS) {
      const doc = buildStarter(key, 900, 1200);
      for (const n of doc.nodes) if (n.type === "image" && n.name !== "Fuzzy border") expect(srcs.has(n.src)).toBe(true);
    }
  });

  it("falls back to a plain border on sizes without a fuzzy one", () => {
    const doc = buildStarter("floralRose", 1234, 1500);
    expect(doc.nodes.some((n) => n.name === "Border" && n.type === "rect" && n.locked)).toBe(true);
  });
});
