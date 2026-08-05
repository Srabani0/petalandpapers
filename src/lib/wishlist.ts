import { prisma } from "@/lib/prisma";

export async function addToWishlist(
  userId: string,
  productId: string,
): Promise<{ error: string } | { ok: true }> {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: { not: "ARCHIVED" } },
  });
  if (!product) return { error: "Product not found." as const };

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
  return { ok: true as const };
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}

export async function getWishlistedProductIds(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(items.map((item) => item.productId));
}

export async function getWishlistItems(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { category: { select: { name: true } }, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWishlistCount(userId: string) {
  return prisma.wishlistItem.count({ where: { userId } });
}
