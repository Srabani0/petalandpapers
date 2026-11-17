import { describe, expect, it } from "vitest";
import { PER_PAGE, searchParams } from "@/lib/studio/stock";

describe("stock search params", () => {
  it("asks for transparent images for cut-outs", () => {
    const p = searchParams(" roses ", "cutout", 2);
    expect(p).toMatchObject({ q: "roses", page: "2", per_page: String(PER_PAGE), colors: "transparent" });
  });

  it("maps photos and illustrations to Pixabay image types", () => {
    expect(searchParams("cake", "photo", 1).image_type).toBe("photo");
    expect(searchParams("cake", "illustration", 1).image_type).toBe("illustration");
    expect(searchParams("cake", "photo", 1).colors).toBeUndefined();
  });

  it("caps very long queries", () => {
    expect(searchParams("a".repeat(300), "photo", 1).q).toHaveLength(100);
  });
});
