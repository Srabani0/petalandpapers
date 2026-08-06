import { prisma } from "@/lib/prisma";

function describeCoupon(coupon: {
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: { toString(): string };
  minOrderValue: { toString(): string };
}) {
  const discount =
    coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}% off` : `₹${Number(coupon.value)} off`;
  const minOrder = Number(coupon.minOrderValue);
  return minOrder > 0 ? `${discount} on orders above ₹${minOrder}` : discount;
}

export async function getActivePromotions() {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return coupons
    .filter((c) => c.usageLimit === null || c.usedCount < c.usageLimit)
    .map((c) => ({ code: c.code, description: describeCoupon(c) }));
}
