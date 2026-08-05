import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { updateOrderStatus } from "@/lib/orders";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const admin = await requireAdmin(request);
  if (!admin) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      address: true,
      payment: true,
      coupon: { select: { code: true } },
      items: { include: { customization: true } },
      customizationRequests: { include: { product: { select: { name: true } } } },
    },
  });
  if (!order) return jsonError("Order not found.", 404);

  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireAdmin(request);
  if (!admin) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await updateOrderStatus(id, admin.sub, parsed.data);
  if ("error" in result) return jsonError(result.error, 400);

  return NextResponse.json({ order: result.order });
}
