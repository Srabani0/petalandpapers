import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, ImageOff } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props {
  params: Promise<{ orderId: string }>;
}

interface ProductSnapshot {
  name: string;
  sku: string;
  price: string;
  finalPrice: string;
  imageUrl: string | null;
}

interface AddressSnapshot {
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CUSTOMIZATION_RECEIVED: "Customization Received",
  DESIGNING: "Designing",
  WAITING_APPROVAL: "Awaiting Your Approval",
  APPROVED: "Approved",
  PRODUCTION: "In Production",
  READY: "Ready",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const session = await getCurrentUser();
  if (!session) redirect(`/login?from=/order-confirmation/${orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order || order.customerId !== session.sub) notFound();

  const address = order.addressSnapshot as unknown as AddressSnapshot;
  const isPaid = order.payment?.status === "SUCCESS";

  return (
    <Section>
      <Container className="max-w-4xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="font-display text-3xl text-navy">
            {isPaid ? "Order Confirmed!" : "Order Received"}
          </h1>
          <p className="max-w-md text-muted">
            Thank you for your order. A confirmation has been sent for order{" "}
            <span className="font-medium text-navy">{order.orderNumber}</span>.
          </p>
          <Badge variant={isPaid ? "sage" : "warning"}>
            {STATUS_LABEL[order.status] ?? order.status}
          </Badge>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
              <h2 className="font-display text-lg text-navy">Items</h2>
              <div className="mt-4 flex flex-col divide-y divide-border">
                {order.items.map((item) => {
                  const snapshot = item.productSnapshot as unknown as ProductSnapshot;
                  return (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-cream-dark">
                        {snapshot.imageUrl ? (
                          <Image
                            src={snapshot.imageUrl}
                            alt={snapshot.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted">
                            <ImageOff className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-sm text-navy sm:text-base">
                            {snapshot.name}
                          </p>
                          <p className="text-sm text-muted">Qty {item.quantity}</p>
                        </div>
                        <span className="font-medium text-navy">
                          ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
              <h2 className="font-display text-lg text-navy">Delivery Address</h2>
              <p className="mt-3 text-sm text-navy">
                {address.fullName}
                {address.label ? ` · ${address.label}` : ""}
              </p>
              <p className="text-sm text-muted">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city},{" "}
                {address.state} — {address.pincode}
              </p>
              <p className="text-sm text-muted">{address.phone}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <OrderSummary
              totals={{
                subtotal: Number(order.subtotal),
                discountAmount: Number(order.discountAmount),
                couponDiscount: Number(order.couponDiscount),
                deliveryCharge: Number(order.deliveryCharge),
                totalAmount: Number(order.totalAmount),
              }}
            />
            <Link href="/shop" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
