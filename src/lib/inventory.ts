import type { InventoryChangeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getStockAlerts() {
  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    include: { category: { select: { name: true } } },
    orderBy: { stock: "asc" },
  });

  return {
    outOfStock: products.filter((p) => p.stock === 0),
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold),
  };
}

export async function listInventoryLogs(limit = 50) {
  return prisma.inventoryLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      product: { select: { name: true, sku: true } },
      performedByUser: { select: { name: true } },
      order: { select: { orderNumber: true } },
    },
  });
}

export async function adjustStock(
  productId: string,
  adminId: string,
  quantityChange: number,
  reason: string,
): Promise<{ error: string } | { ok: true }> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Product not found." as const };

  const quantityAfter = product.stock + quantityChange;
  if (quantityAfter < 0) {
    return { error: `Can't remove ${Math.abs(quantityChange)} — only ${product.stock} in stock.` as const };
  }

  const changeType: InventoryChangeType = quantityChange > 0 ? "STOCK_IN" : "STOCK_OUT";

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        stock: quantityAfter,
        status:
          quantityAfter === 0
            ? "OUT_OF_STOCK"
            : product.status === "OUT_OF_STOCK"
              ? "ACTIVE"
              : product.status,
      },
    }),
    prisma.inventoryLog.create({
      data: {
        productId,
        changeType,
        quantityBefore: product.stock,
        quantityChange,
        quantityAfter,
        reason,
        performedBy: adminId,
      },
    }),
  ]);

  return { ok: true as const };
}
