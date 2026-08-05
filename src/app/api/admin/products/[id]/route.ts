import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { productUpdateSchema } from "@/lib/validations/product";
import { computeFinalPrice } from "@/lib/products";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!product) return jsonError("Product not found.", 404);

  return NextResponse.json({ product });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found.", 404);

  const data = parsed.data;

  if (data.categoryId && data.categoryId !== existing.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return jsonError("Selected category doesn't exist.", 400);
  }

  const nextPrice = data.price ?? Number(existing.price);
  const nextDiscount = data.discountPercent ?? existing.discountPercent;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.discountPercent !== undefined ? { discountPercent: data.discountPercent } : {}),
      finalPrice: computeFinalPrice(nextPrice, nextDiscount),
      ...(data.stock !== undefined ? { stock: data.stock } : {}),
      ...(data.lowStockThreshold !== undefined
        ? { lowStockThreshold: data.lowStockThreshold }
        : {}),
      ...(data.deliveryTime !== undefined ? { deliveryTime: data.deliveryTime } : {}),
      ...(data.isCustomizable !== undefined ? { isCustomizable: data.isCustomizable } : {}),
      ...(data.requiresApproval !== undefined ? { requiresApproval: data.requiresApproval } : {}),
      ...(data.minPhotos !== undefined ? { minPhotos: data.minPhotos } : {}),
      ...(data.maxPhotos !== undefined ? { maxPhotos: data.maxPhotos } : {}),
      ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl || null } : {}),
    },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });

  return NextResponse.json({ product });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found.", 404);

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
