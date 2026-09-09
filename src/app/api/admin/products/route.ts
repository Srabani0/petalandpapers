import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { productSchema, productListQuerySchema } from "@/lib/validations/product";
import { computeFinalPrice, generateSku, listProducts } from "@/lib/products";
import { jsonError, zodError } from "@/lib/api-response";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const { searchParams } = new URL(request.url);
  const parsed = productListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return zodError(parsed.error);

  const result = await listProducts({ ...parsed.data, includeArchived: true });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return jsonError("Selected category doesn't exist.", 400);

  const finalPrice = computeFinalPrice(data.price, data.discountPercent ?? 0);

  // generateSku() derives the next number from existing SKUs, which isn't
  // atomic — retry on the rare unique-constraint conflict (a double-submit,
  // or two admins creating in the same category at once) instead of 500ing.
  let product;
  for (let attempt = 0; attempt < 5; attempt++) {
    const sku = await generateSku(data.categoryId);
    try {
      product = await prisma.product.create({
        data: {
          name: data.name,
          sku,
          description: data.description,
          categoryId: data.categoryId,
          price: data.price,
          discountPercent: data.discountPercent ?? 0,
          finalPrice,
          stock: data.stock ?? 0,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          deliveryTime: data.deliveryTime,
          isCustomizable: data.isCustomizable ?? false,
          requiresApproval: data.requiresApproval ?? false,
          minPhotos: data.minPhotos ?? null,
          maxPhotos: data.maxPhotos ?? null,
          videoUrl: data.videoUrl || null,
        },
        include: { images: true, category: true },
      });
      break;
    } catch (error) {
      const isSkuConflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isSkuConflict || attempt === 4) throw error;
    }
  }

  return NextResponse.json({ product }, { status: 201 });
}
