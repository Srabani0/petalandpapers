import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { computeFinalPrice } from "@/lib/products";

describe("computeFinalPrice", () => {
  it("applies the percentage discount and rounds to paise", () => {
    expect(computeFinalPrice(1000, 10)).toBe(900);
    expect(computeFinalPrice(999, 15)).toBe(849.15);
    expect(computeFinalPrice(333.33, 33)).toBe(223.33);
  });

  it("0% leaves the price unchanged and 100% makes it free", () => {
    expect(computeFinalPrice(499, 0)).toBe(499);
    expect(computeFinalPrice(499, 100)).toBe(0);
  });
});
