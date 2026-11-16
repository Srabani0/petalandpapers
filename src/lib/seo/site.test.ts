import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  categoryPath,
  parseProductParam,
  productPath,
  safeDecode,
  truncate,
} from "@/lib/seo/site";

const ID = "3f2b8c1e-9a4d-4e6f-8b1a-2c3d4e5f6a7b";

describe("productPath", () => {
  it("builds a keyword slug followed by the id", () => {
    expect(productPath({ id: ID, name: "Personalized Scrapbook" })).toBe(
      `/product/personalized-scrapbook-${ID}`,
    );
  });

  it("strips punctuation, converts & and collapses separators", () => {
    expect(productPath({ id: ID, name: "  Mom & Dad's — Photo Frame!! " })).toBe(
      `/product/mom-and-dad-s-photo-frame-${ID}`,
    );
  });

  it("falls back to the bare id when the name has no usable characters", () => {
    expect(productPath({ id: ID, name: "★★★" })).toBe(`/product/${ID}`);
  });

  it("caps very long names without leaving a trailing dash", () => {
    const path = productPath({ id: ID, name: "a ".repeat(100) });
    const slug = path.replace("/product/", "").replace(`-${ID}`, "");
    expect(slug.length).toBeLessThanOrEqual(70);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("parseProductParam", () => {
  it("round-trips productPath output", () => {
    const path = productPath({ id: ID, name: "Explosion Box" });
    expect(parseProductParam(path.replace("/product/", ""))).toBe(ID);
  });

  it("accepts a bare uuid (legacy links)", () => {
    expect(parseProductParam(ID)).toBe(ID);
  });

  it("is case-insensitive on the uuid and lowercases it", () => {
    expect(parseProductParam(`x-${ID.toUpperCase()}`)).toBe(ID);
  });

  it("returns non-uuid input unchanged so lookup simply 404s", () => {
    expect(parseProductParam("not-a-product")).toBe("not-a-product");
  });
});

describe("safeDecode", () => {
  it("decodes valid sequences and survives malformed ones", () => {
    expect(safeDecode("a%20b")).toBe("a b");
    expect(safeDecode("100%")).toBe("100%");
  });
});

describe("absoluteUrl", () => {
  it("prefixes the configured site URL", () => {
    expect(absoluteUrl("/shop")).toBe("https://www.petalandpapers.test/shop");
    expect(absoluteUrl("shop")).toBe("https://www.petalandpapers.test/shop");
    expect(absoluteUrl()).toBe("https://www.petalandpapers.test/");
  });

  it("leaves absolute URLs (e.g. Cloudinary images) untouched", () => {
    expect(absoluteUrl("https://res.cloudinary.com/x/y.jpg")).toBe("https://res.cloudinary.com/x/y.jpg");
  });
});

describe("categoryPath", () => {
  it("prefixes /category/", () => {
    expect(categoryPath("scrapbooks")).toBe("/category/scrapbooks");
  });
});

describe("truncate", () => {
  it("returns short text as-is (whitespace normalised)", () => {
    expect(truncate("  hello \n  world ")).toBe("hello world");
  });

  it("cuts on a word boundary and adds an ellipsis within the limit", () => {
    const out = truncate("word ".repeat(80), 60);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/wor…$/);
  });
});
