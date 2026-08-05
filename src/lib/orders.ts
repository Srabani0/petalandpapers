import { Prisma, type OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { getAvailableTransitions, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { sendEmail } from "@/lib/email/brevo";
import { orderStatusEmail } from "@/lib/email/templates";

type OrderWithPaymentAndItems = Prisma.OrderGetPayload<{
  include: { payment: true; items: true };
}>;
type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: `PP-${year}-` } },
  });
  return `PP-${year}-${(count + 1).toString().padStart(5, "0")}`;
}

/** Creates a PENDING order + payment record from the customer's current cart. */
export async function createPendingOrder(
  userId: string,
  addressId: string,
): Promise<{ error: string } | { order: OrderWithPaymentAndItems }> {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    return { error: "Delivery address not found." as const };
  }

  const cart = await getOrCreateCart(userId);
  if (cart.items.length === 0) return { error: "Your cart is empty." as const };

  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      return { error: `"${item.product.name}" only has ${item.product.stock} left in stock.` as const };
    }
  }

  const totals = computeCartTotals(cart);
  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: userId,
      addressId,
      addressSnapshot: {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      couponId: cart.couponId,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      couponDiscount: totals.couponDiscount,
      deliveryCharge: totals.deliveryCharge,
      totalAmount: totals.totalAmount,
      status: "PENDING",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          productSnapshot: {
            name: item.product.name,
            sku: item.product.sku,
            price: item.product.price.toString(),
            finalPrice: item.product.finalPrice.toString(),
            imageUrl: item.product.images[0]?.url ?? null,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customizationId: item.customizationId,
        })),
      },
      payment: {
        create: {
          amount: totals.totalAmount,
          status: "PENDING",
        },
      },
    },
    include: { payment: true, items: true },
  });

  return { order };
}

/**
 * Idempotent (NFR-REL-04): if this order's payment is already marked
 * SUCCESS, returns the existing order rather than re-applying side effects.
 */
export async function confirmOrderPayment(
  orderId: string,
  razorpay: { orderId: string | null; paymentId: string; signature: string | null },
): Promise<{ error: string } | { order: OrderWithPaymentAndItems | OrderWithItems }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: true },
  });
  if (!order || !order.payment) return { error: "Order not found." as const };

  if (order.payment.status === "SUCCESS") {
    return { order };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: order.payment!.id },
      data: {
        status: "SUCCESS",
        razorpayOrderId: razorpay.orderId,
        razorpayPaymentId: razorpay.paymentId,
        razorpaySignature: razorpay.signature,
      },
    });

    const confirmed = await tx.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
      include: { items: true },
    });

    for (const item of confirmed.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const quantityAfter = Math.max(0, product.stock - item.quantity);
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: quantityAfter,
          status: quantityAfter === 0 ? "OUT_OF_STOCK" : product.status,
        },
      });
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          changeType: "ORDER_DEDUCTION",
          quantityBefore: product.stock,
          quantityChange: -item.quantity,
          quantityAfter,
          reason: `Order ${confirmed.orderNumber}`,
          orderId: confirmed.id,
          performedBy: confirmed.customerId,
        },
      });

      if (item.customizationId) {
        await tx.customizationRequest.update({
          where: { id: item.customizationId },
          data: { orderId: confirmed.id, status: "RECEIVED" },
        });
      }
    }

    if (confirmed.couponId) {
      await tx.coupon.update({
        where: { id: confirmed.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    const cart = await tx.cart.findUnique({ where: { userId: confirmed.customerId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    }

    return confirmed;
  });

  return { order: updated };
}

/**
 * Admin-driven status change (FR: 11-state order status machine). Restocks
 * items on CANCELLED/REFUNDED, but only if stock was actually deducted for
 * this order (i.e. it had already moved past PENDING — see
 * `confirmOrderPayment`), so an abandoned/unpaid order can't double-credit
 * inventory it never took.
 */
export async function updateOrderStatus(
  orderId: string,
  adminId: string,
  input: { status: OrderStatus; trackingNumber?: string; courierName?: string; adminNotes?: string },
): Promise<{ error: string } | { order: OrderWithPaymentAndItems }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, customer: { select: { name: true, email: true } } },
  });
  if (!order) return { error: "Order not found." as const };

  const allowed = getAvailableTransitions(order.status);
  if (!allowed.includes(input.status)) {
    return {
      error: `Can't move from "${ORDER_STATUS_LABEL[order.status]}" to "${ORDER_STATUS_LABEL[input.status]}".`,
    };
  }

  const shouldRestock =
    (input.status === "CANCELLED" || input.status === "REFUNDED") && order.status !== "PENDING";

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
        trackingNumber: input.trackingNumber ?? order.trackingNumber,
        courierName: input.courierName ?? order.courierName,
        adminNotes: input.adminNotes ?? order.adminNotes,
      },
      include: { payment: true, items: true },
    });

    if (shouldRestock) {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const quantityAfter = product.stock + item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: quantityAfter,
            status: product.status === "OUT_OF_STOCK" ? "ACTIVE" : product.status,
          },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeType: "RETURN",
            quantityBefore: product.stock,
            quantityChange: item.quantity,
            quantityAfter,
            reason: `Order ${order.orderNumber} ${input.status.toLowerCase()}`,
            orderId: order.id,
            performedBy: adminId,
          },
        });
      }
    }

    return result;
  });

  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`;
  await sendEmail({
    to: order.customer.email,
    toName: order.customer.name,
    subject: `Order ${order.orderNumber} — ${ORDER_STATUS_LABEL[input.status]}`,
    html: orderStatusEmail({
      name: order.customer.name,
      orderNumber: order.orderNumber,
      statusLabel: ORDER_STATUS_LABEL[input.status],
      trackingNumber: updated.trackingNumber,
      courierName: updated.courierName,
      orderUrl,
    }),
  });

  return { order: updated };
}
