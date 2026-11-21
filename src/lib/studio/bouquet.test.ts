import { describe, expect, it } from "vitest";
import { BOUQUET_CANVAS, BOUQUET_FLOWERS, DEFAULT_RECIPE, buildBouquetDoc, priceRecipe } from "@/lib/studio/bouquet";
import { parseDesignDoc, type BouquetRecipe } from "@/lib/studio/doc";

const recipe = (over: Partial<BouquetRecipe> = {}): BouquetRecipe => ({ ...DEFAULT_RECIPE, ...over });

describe("bouquet pricing", () => {
  it("adds up size, flowers, wrap and greenery", () => {
    const priced = priceRecipe(
      recipe({ size: "classic", flowers: [{ id: "rose-red", count: 2 }, { id: "daisy-white", count: 1 }], wrap: "blush", fillers: ["leaves"] }),
    );
    if (!("total" in priced)) throw new Error(priced.error);
    // 199 base + 2×35 roses + 25 daisy + 29 blush wrap + 25 leaves
    expect(priced.total).toBe(199 + 70 + 25 + 29 + 25);
    expect(priced.stems).toBe(3);
  });

  it("enforces the size's flower limit", () => {
    expect(priceRecipe(recipe({ size: "mini", flowers: [{ id: "rose-red", count: 7 }] }))).toEqual({
      error: "A Mini bouquet holds up to 6 flowers.",
    });
  });

  it("rejects unknown flowers, empty bouquets and duplicates", () => {
    expect("error" in priceRecipe(recipe({ flowers: [{ id: "cactus-green", count: 1 }] }))).toBe(true);
    expect("error" in priceRecipe(recipe({ flowers: [] }))).toBe(true);
    expect("error" in priceRecipe(recipe({ flowers: [{ id: "rose-red", count: 1 }, { id: "rose-red", count: 1 }] }))).toBe(true);
    expect("error" in priceRecipe(recipe({ wrap: "gold-leaf" }))).toBe(true);
  });

  it("offers every flower kind with a picture", () => {
    expect(BOUQUET_FLOWERS.length).toBeGreaterThan(30);
    for (const f of BOUQUET_FLOWERS) expect(f.src).toMatch(/^\/studio\/library\/chenille\//);
  });
});

describe("bouquet design", () => {
  it("builds a valid, fully locked design that carries its recipe", () => {
    const r = recipe({ size: "grand", flowers: [{ id: "sunflower-classic", count: 12 }, { id: "tulip-red", count: 12 }] });
    const doc = buildBouquetDoc(r);
    const parsed = parseDesignDoc(doc);
    expect("doc" in parsed).toBe(true);
    expect(doc.width).toBe(BOUQUET_CANVAS.width);
    expect(doc.meta?.bouquet).toEqual(r);
    expect(doc.nodes.filter((n) => n.id.startsWith("bq-f-"))).toHaveLength(24);
    expect(doc.nodes.every((n) => n.locked)).toBe(true);
  });

  it("is deterministic, so previews don't jump around", () => {
    expect(buildBouquetDoc(DEFAULT_RECIPE)).toEqual(buildBouquetDoc(DEFAULT_RECIPE));
  });

  it("adds the gift tag only when there's a message", () => {
    expect(buildBouquetDoc(recipe({ message: "", from: "" })).nodes.some((n) => n.id === "bq-tag")).toBe(false);
    expect(buildBouquetDoc(recipe({ message: "Love you" })).nodes.some((n) => n.id === "bq-msg")).toBe(true);
  });
});
