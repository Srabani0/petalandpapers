import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, status: { not: "ARCHIVED" } },
  });
  if (!product) return jsonError("Product not found.", 404);

  const form = await prisma.customizationForm.findUnique({
    where: { productId: id },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ form });
}
