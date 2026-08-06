import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Any status past PENDING and short of CANCELLED/REFUNDED represents money actually taken. */
export const REVENUE_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "CUSTOMIZATION_RECEIVED",
  "DESIGNING",
  "WAITING_APPROVAL",
  "APPROVED",
  "PRODUCTION",
  "READY",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function getDashboardKpis() {
  const [revenueAgg, orders, products, customers, pending, production, delivered] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PRODUCTION" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
  ]);

  return {
    revenue: round2(Number(revenueAgg._sum.totalAmount ?? 0)),
    orders,
    products,
    customers,
    pending,
    inProduction: production,
    delivered,
  };
}

function monthKey(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export async function getMonthlySales(months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: since } },
    select: { createdAt: true, totalAmount: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    buckets.set(monthKey(d), 0);
  }
  for (const order of orders) {
    const key = monthKey(order.createdAt);
    buckets.set(key, (buckets.get(key) ?? 0) + Number(order.totalAmount));
  }

  return [...buckets.entries()].map(([month, revenue]) => ({ month, revenue: round2(revenue) }));
}

function dayKey(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export async function getOrderTrends(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.set(dayKey(d), 0);
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([day, orders]) => ({ day, orders }));
}

export async function getTopProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: REVENUE_STATUSES } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return grouped.map((g) => ({
    productId: g.productId,
    name: nameById.get(g.productId) ?? "Unknown",
    quantity: g._sum.quantity ?? 0,
  }));
}

export async function getCategoryPerformance() {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: REVENUE_STATUSES } } },
    select: {
      quantity: true,
      unitPrice: true,
      product: { select: { category: { select: { id: true, name: true } } } },
    },
  });

  const byCategory = new Map<string, { name: string; revenue: number }>();
  for (const item of items) {
    const cat = item.product.category;
    const revenue = Number(item.unitPrice) * item.quantity;
    const existing = byCategory.get(cat.id);
    if (existing) existing.revenue += revenue;
    else byCategory.set(cat.id, { name: cat.name, revenue });
  }

  return [...byCategory.values()]
    .map((c) => ({ ...c, revenue: round2(c.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}
