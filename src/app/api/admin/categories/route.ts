import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { categorySchema } from "@/lib/validations/category";
import { slugify } from "@/lib/products";
import { jsonError, zodError } from "@/lib/api-response";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { name, skuPrefix, description, imageUrl, isActive, sortOrder } = parsed.data;
  const slug = slugify(name);

  const [nameTaken, slugTaken, prefixTaken] = await Promise.all([
    prisma.category.findUnique({ where: { name } }),
    prisma.category.findUnique({ where: { slug } }),
    prisma.category.findUnique({ where: { skuPrefix } }),
  ]);
  if (nameTaken || slugTaken) return jsonError("A category with this name already exists.", 409);
  if (prefixTaken) return jsonError("This SKU prefix is already used by another category.", 409);

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      skuPrefix,
      description: description || null,
      imageUrl: imageUrl || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
