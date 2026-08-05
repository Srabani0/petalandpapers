import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductListQuery } from "@/lib/validations/product";

export function computeFinalPrice(price: number | Prisma.Decimal, discountPercent: number) {
  const base = typeof price === "number" ? price : Number(price);
  return Math.round(base * (1 - discountPercent / 100) * 100) / 100;
}

/** Category prefix + next sequence number, e.g. SCRAP-001 (FR-PROD-02). */
export async function generateSku(categoryId: string) {
  const category = await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });
  const count = await prisma.product.count({ where: { categoryId } });
  return `${category.skuPrefix}-${(count + 1).toString().padStart(3, "0")}`;
}

const productListInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: true,
};

export async function listProducts(
  query: ProductListQuery & { includeArchived?: boolean },
) {
  const { page, pageSize, category, q, customizable, sort, includeArchived } = query;

  const where: Prisma.ProductWhereInput = {
    ...(includeArchived ? {} : { status: { not: "ARCHIVED" } }),
    ...(category ? { category: { slug: category } } : {}),
    ...(customizable !== undefined ? { isCustomizable: customizable } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { finalPrice: "asc" }
      : sort === "price-desc"
        ? { finalPrice: "desc" }
        : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: productListInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductById(id: string, { includeArchived = false } = {}) {
  return prisma.product.findFirst({
    where: { id, ...(includeArchived ? {} : { status: { not: "ARCHIVED" } }) },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      customizationForm: { include: { fields: { orderBy: { sortOrder: "asc" } } } },
    },
  });
}

export async function listCategories({ activeOnly = true } = {}) {
  return prisma.category.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export { slugify } from "@/lib/slug";
