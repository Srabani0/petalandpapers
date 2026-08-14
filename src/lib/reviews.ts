import type { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createReview(
  userId: string,
  input: {
    orderId: string;
    productId: string;
    rating: number;
    title?: string;
    body: string;
    images?: string[];
  },
): Promise<{ error: string } | { ok: true }> {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });
  if (!order || order.customerId !== userId) return { error: "Order not found." as const };
  if (order.status !== "DELIVERED") {
    return { error: "You can review a product once your order is delivered." as const };
  }
  if (!order.items.some((item) => item.productId === input.productId)) {
    return { error: "This product isn't part of this order." as const };
  }

  const existing = await prisma.review.findFirst({
    where: { orderId: input.orderId, productId: input.productId, customerId: userId },
  });
  if (existing) return { error: "You've already reviewed this product for this order." as const };

  await prisma.review.create({
    data: {
      customerId: userId,
      productId: input.productId,
      orderId: input.orderId,
      rating: input.rating,
      title: input.title || null,
      body: input.body,
      images: input.images ?? [],
      status: "PENDING",
    },
  });

  return { ok: true as const };
}

/** Approved reviews shown as testimonials on the homepage — highest-rated, most recent first. */
export async function listFeaturedReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: "APPROVED" },
    include: {
      customer: { select: { name: true } },
      product: { select: { name: true } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function listReviewsForAdmin(status?: ReviewStatus) {
  return prisma.review.findMany({
    where: status ? { status } : undefined,
    include: {
      customer: { select: { name: true, email: true } },
      product: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function moderateReview(
  id: string,
  status: ReviewStatus,
  adminNote?: string,
): Promise<{ error: string } | { ok: true }> {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return { error: "Review not found." as const };

  await prisma.review.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });

  return { ok: true as const };
}

/** Approved reviews for a single product's page, with a star-rating breakdown. */
export async function getProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return { reviews, count, average, breakdown };
}
