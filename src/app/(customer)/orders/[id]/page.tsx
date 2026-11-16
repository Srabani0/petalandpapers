import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { Download, ImageOff, Gift, Zap, CalendarHeart, MessageSquareHeart } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { DesignApproval } from "@/components/orders/DesignApproval";
import { ReviewForm } from "@/components/orders/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE_VARIANT } from "@/lib/order-status";

const REVIEW_STATUS_NOTE: Record<string, string> = {
  PENDING: "Submitted — awaiting approval.",
  APPROVED: "Published.",
  HIDDEN: "Not published.",
};

interface Props {
  params: Promise<{ id: string }>;
}

interface ProductSnapshot {
  name: string;
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

const CUSTOMIZATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  RECEIVED: "Received",
  IN_DESIGN: "In Design",
  AWAITING_APPROVAL: "Awaiting Your Approval",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes Requested",
  REJECTED: "Rejected",
};

export const metadata: Metadata = { title: "Order Detail" };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) redirect(`/login?from=/orders/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      customizationRequests: { include: { product: { select: { name: true } } } },
      reviews: true,
    },
  });
  if (!order || order.customerId !== session.sub) notFound();

  const reviewableItems =
    order.status === "DELIVERED"
      ? order.items.filter(
          (item, index) => order.items.findIndex((i) => i.productId === item.productId) === index,
        )
      : [];

  const address = order.addressSnapshot as unknown as AddressSnapshot;

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-navy">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-muted">
              Placed {order.createdAt.toLocaleDateString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
              {ORDER_STATUS_LABEL[order.status]}
            </Badge>
            {order.status !== "PENDING" ? (
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download className="h-4 w-4" />
                Invoice
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
              <h2 className="font-display text-lg text-navy">Status</h2>
              <div className="mt-4">
                <OrderTimeline
                  status={order.status}
                  isCustomized={order.customizationRequests.length > 0 || order.items.some((i) => i.designId)}
                />
              </div>
            </div>

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

            {order.giftMessage || order.scheduledDeliveryDate || order.isRushOrder || order.giftWrap ? (
              <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
                <h2 className="font-display text-lg text-navy">Gift &amp; Delivery Details</h2>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  {order.isRushOrder ? (
                    <p className="flex items-center gap-2 text-navy">
                      <Zap className="h-4 w-4 text-gold-dark" /> Rush order — priority handling
                    </p>
                  ) : null}
                  {order.giftWrap ? (
                    <p className="flex items-center gap-2 text-navy">
                      <Gift className="h-4 w-4 text-gold-dark" /> Gift wrapped
                    </p>
                  ) : null}
                  {order.scheduledDeliveryDate ? (
                    <p className="flex items-center gap-2 text-navy">
                      <CalendarHeart className="h-4 w-4 text-gold-dark" /> Scheduled for{" "}
                      {order.scheduledDeliveryDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  ) : null}
                  {order.giftMessage ? (
                    <p className="flex items-start gap-2 text-navy">
                      <MessageSquareHeart className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                      <span className="italic text-muted">&ldquo;{order.giftMessage}&rdquo;</span>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {reviewableItems.length > 0 ? (
              <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
                <h2 className="font-display text-lg text-navy">Rate Your Purchase</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {reviewableItems.map((item) => {
                    const snapshot = item.productSnapshot as unknown as ProductSnapshot;
                    const existingReview = order.reviews.find((r) => r.productId === item.productId);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-cream/40 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-cream-dark">
                            {snapshot.imageUrl ? (
                              <Image
                                src={snapshot.imageUrl}
                                alt={snapshot.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted">
                                <ImageOff className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-navy">{snapshot.name}</p>
                        </div>
                        {existingReview ? (
                          <div className="flex items-center gap-3">
                            <StarRating value={existingReview.rating} size="sm" />
                            <span className="text-sm text-muted">
                              {REVIEW_STATUS_NOTE[existingReview.status]}
                            </span>
                          </div>
                        ) : (
                          <ReviewForm
                            orderId={order.id}
                            productId={item.productId}
                            productName={snapshot.name}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {order.customizationRequests.length > 0 ? (
              <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
                <h2 className="font-display text-lg text-navy">Your Customization</h2>
                <div className="mt-4 flex flex-col gap-6">
                  {order.customizationRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-navy">{request.product.name}</p>
                        <Badge
                          variant={
                            request.status === "APPROVED"
                              ? "success"
                              : request.status === "AWAITING_APPROVAL"
                                ? "warning"
                                : "gold"
                          }
                        >
                          {CUSTOMIZATION_STATUS_LABEL[request.status]}
                        </Badge>
                      </div>
                      {request.previewDesignUrl ? (
                        <a
                          href={request.previewDesignUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative mt-3 block h-40 w-40 overflow-hidden rounded-md border border-border bg-cream-dark"
                        >
                          <Image src={request.previewDesignUrl} alt="" fill sizes="160px" className="object-cover" />
                        </a>
                      ) : (
                        <p className="mt-2 text-sm text-muted">
                          We&apos;ll post a design preview here once it&apos;s ready.
                        </p>
                      )}
                      {request.status === "AWAITING_APPROVAL" ? (
                        <DesignApproval customizationRequestId={request.id} />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

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
              extraRows={[
                ...(order.isRushOrder ? [{ label: "Rush Order Fee", value: Number(order.rushFee) }] : []),
                ...(order.giftWrap ? [{ label: "Gift Wrap", value: Number(order.giftWrapFee) }] : []),
              ]}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
