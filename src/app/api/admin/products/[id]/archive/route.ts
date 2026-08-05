import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError } from "@/lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found.", 404);

  const product = await prisma.product.update({
    where: { id },
    data: { status: existing.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED" },
  });

  return NextResponse.json({ product });
}
