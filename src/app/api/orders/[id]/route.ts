import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      payment: true,
      coupon: { select: { code: true } },
      items: true,
      customizationRequests: { include: { product: { select: { name: true } } } },
    },
  });
  if (!order || order.customerId !== session.sub) return jsonError("Order not found.", 404);

  return NextResponse.json({ order });
}
