import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { checkoutSchema } from "@/lib/validations/cart";
import { createPendingOrder, createCodOrder } from "@/lib/orders";
import { createOrder, mockSignature } from "@/lib/payments";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const extras = {
    giftMessage: parsed.data.giftMessage,
    scheduledDeliveryDate: parsed.data.scheduledDeliveryDate,
    isRushOrder: parsed.data.isRushOrder,
    giftWrap: parsed.data.giftWrap,
  };

  if (parsed.data.paymentMethod === "COD") {
    const codResult = await createCodOrder(session.sub, parsed.data.addressId, extras);
    if ("error" in codResult) return jsonError(codResult.error, 400);
    return NextResponse.json({
      orderId: codResult.order.id,
      orderNumber: codResult.order.orderNumber,
      cod: true,
    });
  }

  const result = await createPendingOrder(session.sub, parsed.data.addressId, extras);
  if ("error" in result) return jsonError(result.error, 400);

  const { order } = result;
  const amount = Number(order.payment!.amount);

  let razorpayOrder;
  try {
    razorpayOrder = await createOrder(amount, order.orderNumber);
  } catch (error) {
    console.error("[payments] Razorpay order creation failed:", error);
    return jsonError("Couldn't start payment. Please try again.", 502);
  }

  await prisma.payment.update({
    where: { id: order.payment!.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  if (razorpayOrder.mock) {
    const mockPaymentId = `mock_payment_${randomUUID()}`;
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount,
      currency: "INR",
      mock: true,
      mockPayment: {
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: mockPaymentId,
        signature: mockSignature(razorpayOrder.id, mockPaymentId),
      },
    });
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount,
    currency: "INR",
    mock: false,
    razorpay: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: razorpayOrder.id },
  });
}
