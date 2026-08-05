import { prisma } from "@/lib/prisma";

export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_CHARGE = 99;

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" as const }, take: 1 } } },
      customization: true,
    },
    orderBy: { id: "asc" as const },
  },
  coupon: true,
};

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>;

export async function getOrCreateCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: cartInclude,
  });

  if (cart.coupon && !couponStillQualifies(cart.coupon, cart.items)) {
    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    return { ...cart, couponId: null, coupon: null };
  }

  return cart;
}

function couponStillQualifies(
  coupon: { isActive: boolean; expiresAt: Date | null; minOrderValue: { toString(): string } },
  items: { unitPrice: { toString(): string }; quantity: number }[],
) {
  if (!coupon.isActive) return false;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return false;

  const afterProductDiscount = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  return afterProductDiscount >= Number(coupon.minOrderValue);
}

export function computeCartTotals(cart: CartWithItems) {
  let subtotal = 0;
  let afterProductDiscount = 0;

  for (const item of cart.items) {
    subtotal += Number(item.product.price) * item.quantity;
    afterProductDiscount += Number(item.unitPrice) * item.quantity;
  }

  const discountAmount = Math.max(0, subtotal - afterProductDiscount);

  let couponDiscount = 0;
  if (cart.coupon) {
    couponDiscount = computeCouponDiscount(cart.coupon, afterProductDiscount);
  }

  const afterCoupon = Math.max(0, afterProductDiscount - couponDiscount);
  const deliveryCharge =
    cart.items.length === 0 || afterCoupon >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const totalAmount = afterCoupon + deliveryCharge;

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    couponDiscount: round2(couponDiscount),
    deliveryCharge,
    totalAmount: round2(totalAmount),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

interface CouponLike {
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: number | { toString(): string };
  maxDiscountAmount: number | { toString(): string } | null;
}

function computeCouponDiscount(coupon: CouponLike, amount: number) {
  const value = Number(coupon.value);
  if (coupon.type === "PERCENTAGE") {
    let discount = (amount * value) / 100;
    if (coupon.maxDiscountAmount !== null) {
      discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    }
    return Math.min(discount, amount);
  }
  return Math.min(value, amount);
}

export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number,
  customizationRequestId?: string,
): Promise<{ error: string } | { ok: true }> {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: { not: "ARCHIVED" } },
  });
  if (!product) return { error: "Product not found." as const };
  if (product.stock <= 0 || product.status === "OUT_OF_STOCK") {
    return { error: "This product is out of stock." as const };
  }
  if (quantity > product.stock) {
    return { error: `Only ${product.stock} left in stock.` as const };
  }

  let customizationId: string | undefined;
  if (customizationRequestId) {
    const request = await prisma.customizationRequest.findUnique({
      where: { id: customizationRequestId },
    });
    if (!request || request.customerId !== userId || request.productId !== productId) {
      return { error: "Customization request not found." as const };
    }
    const alreadyInCart = await prisma.cartItem.findFirst({
      where: { customizationId: customizationRequestId },
    });
    if (alreadyInCart) return { error: "This customization is already in your cart." as const };
    customizationId = customizationRequestId;
  }

  const cart = await getOrCreateCart(userId);
  const unitPrice = product.finalPrice;

  if (!customizationId) {
    const existing = cart.items.find(
      (item) => item.productId === productId && item.customizationId === null,
    );
    if (existing) {
      const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity, unitPrice },
      });
      return { ok: true as const };
    }
  }

  await prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity, unitPrice, customizationId },
  });
  return { ok: true as const };
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<{ error: string } | { ok: true }> {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });
  if (!item || item.cart.userId !== userId) return { error: "Cart item not found." as const };
  if (quantity > item.product.stock) {
    return { error: `Only ${item.product.stock} left in stock.` as const };
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return { ok: true as const };
}

export async function removeCartItem(
  userId: string,
  itemId: string,
): Promise<{ error: string } | { ok: true }> {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== userId) return { error: "Cart item not found." as const };

  await prisma.cartItem.delete({ where: { id: itemId } });
  return { ok: true as const };
}

export async function applyCouponToCart(
  userId: string,
  code: string,
): Promise<{ error: string } | { ok: true }> {
  const cart = await getOrCreateCart(userId);
  if (cart.items.length === 0) return { error: "Your cart is empty." as const };

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return { error: "Invalid coupon code." as const };
  if (!coupon.isActive) return { error: "This coupon is no longer active." as const };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { error: "This coupon has expired." as const };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { error: "This coupon has reached its usage limit." as const };
  }

  const afterProductDiscount = cart.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  if (afterProductDiscount < Number(coupon.minOrderValue)) {
    return {
      error: `Add ₹${(Number(coupon.minOrderValue) - afterProductDiscount).toFixed(2)} more to use this coupon.`,
    } as const;
  }

  if (coupon.applicableCategories.length > 0) {
    const categoryIds = cart.items.map((item) => item.product.categoryId);
    const allQualify = categoryIds.every((id) => coupon.applicableCategories.includes(id));
    if (!allQualify) {
      return { error: "This coupon doesn't apply to everything in your cart." as const };
    }
  }

  const pastUses = await prisma.order.count({
    where: { customerId: userId, couponId: coupon.id, status: { not: "CANCELLED" } },
  });
  if (pastUses >= coupon.perUserLimit) {
    return { error: "You've already used this coupon." as const };
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });
  return { ok: true as const };
}

export async function removeCouponFromCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
}

export async function getCartItemCount(userId: string) {
  const result = await prisma.cartItem.aggregate({
    where: { cart: { userId } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
