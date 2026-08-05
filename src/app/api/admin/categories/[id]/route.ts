import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { categoryUpdateSchema } from "@/lib/validations/category";
import { slugify } from "@/lib/products";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return jsonError("Category not found.", 404);

  const { name, skuPrefix, description, imageUrl, isActive, sortOrder } = parsed.data;

  if (name && name !== existing.name) {
    const nameTaken = await prisma.category.findUnique({ where: { name } });
    if (nameTaken) return jsonError("A category with this name already exists.", 409);
  }
  if (skuPrefix && skuPrefix !== existing.skuPrefix) {
    const prefixTaken = await prisma.category.findUnique({ where: { skuPrefix } });
    if (prefixTaken) return jsonError("This SKU prefix is already used by another category.", 409);
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name ? { name, slug: slugify(name) } : {}),
      ...(skuPrefix ? { skuPrefix } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return jsonError(
      `Can't delete — ${productCount} product(s) still use this category.`,
      409,
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
