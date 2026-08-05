import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { verifyPaymentSchema } from "@/lib/validations/payment";
import { verifySignature } from "@/lib/payments";
import { confirmOrderPayment } from "@/lib/orders";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== session.sub) return jsonError("Order not found.", 404);

  const valid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!valid) return jsonError("Payment verification failed.", 400);

  const result = await confirmOrderPayment(orderId, {
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });
  if ("error" in result) return jsonError(result.error, 404);

  return NextResponse.json({ order: result.order });
}
