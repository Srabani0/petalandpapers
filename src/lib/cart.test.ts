import { describe, expect, it, vi } from "vitest";

// cart.ts imports the Prisma client at module load; totals math is pure, so stub it.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { computeCartTotals, type CartWithItems } from "@/lib/cart";
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/lib/cart-constants";

type Coupon = {
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: number;
  maxDiscountAmount: number | null;
};

function cart(
  items: { price: number; unitPrice: number; quantity: number }[],
  coupon: Coupon | null = null,
) {
  return {
    items: items.map((i) => ({
      product: { price: i.price },
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    coupon,
  } as unknown as CartWithItems;
}

describe("computeCartTotals", () => {
  it("empty cart costs nothing, including delivery", () => {
    expect(computeCartTotals(cart([]))).toMatchObject({ subtotal: 0, deliveryCharge: 0, totalAmount: 0 });
  });

  it("separates MRP subtotal from product discount", () => {
    const t = computeCartTotals(cart([{ price: 1000, unitPrice: 900, quantity: 2 }]));
    expect(t.subtotal).toBe(2000);
    expect(t.discountAmount).toBe(200);
    expect(t.totalAmount).toBe(1800); // above free-delivery threshold
    expect(t.deliveryCharge).toBe(0);
  });

  it("adds the delivery charge below the free-delivery threshold", () => {
    const t = computeCartTotals(cart([{ price: 500, unitPrice: 500, quantity: 1 }]));
    expect(t.deliveryCharge).toBe(DELIVERY_CHARGE);
    expect(t.totalAmount).toBe(500 + DELIVERY_CHARGE);
  });

  it("free delivery applies exactly at the threshold", () => {
    const t = computeCartTotals(cart([{ price: FREE_DELIVERY_THRESHOLD, unitPrice: FREE_DELIVERY_THRESHOLD, quantity: 1 }]));
    expect(t.deliveryCharge).toBe(0);
  });

  it("percentage coupons respect the max-discount cap", () => {
    const t = computeCartTotals(
      cart([{ price: 2000, unitPrice: 2000, quantity: 1 }], { type: "PERCENTAGE", value: 50, maxDiscountAmount: 300 }),
    );
    expect(t.couponDiscount).toBe(300);
    expect(t.totalAmount).toBe(1700);
  });

  it("flat coupons never exceed the cart value", () => {
    const t = computeCartTotals(
      cart([{ price: 100, unitPrice: 100, quantity: 1 }], { type: "FLAT_AMOUNT", value: 500, maxDiscountAmount: null }),
    );
    expect(t.couponDiscount).toBe(100);
    expect(t.totalAmount).toBe(DELIVERY_CHARGE); // goods are free, delivery still charged
  });

  it("coupon discount is applied BEFORE the free-delivery check", () => {
    // 1050 qualifies for free delivery on its own, but a 100 coupon drops it below 999.
    const t = computeCartTotals(
      cart([{ price: 1050, unitPrice: 1050, quantity: 1 }], { type: "FLAT_AMOUNT", value: 100, maxDiscountAmount: null }),
    );
    expect(t.deliveryCharge).toBe(DELIVERY_CHARGE); // 950 < 999, matches the shipping policy
    expect(t.totalAmount).toBe(950 + DELIVERY_CHARGE);
  });
});
