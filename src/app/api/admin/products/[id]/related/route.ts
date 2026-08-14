import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError, zodError } from "@/lib/api-response";

const relatedSchema = z.object({
  productIds: z.array(z.string().trim().min(1)).max(12),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found.", 404);

  const body = await request.json().catch(() => null);
  const parsed = relatedSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const productIds = parsed.data.productIds.filter((pid) => pid !== id);

  if (productIds.length > 0) {
    const count = await prisma.product.count({ where: { id: { in: productIds } } });
    if (count !== productIds.length) return jsonError("One or more selected products don't exist.", 400);
  }

  const product = await prisma.product.update({
    where: { id },
    data: { relatedProductIds: productIds },
  });

  return NextResponse.json({ product });
}
