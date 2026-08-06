import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift, Zap, CalendarHeart, MessageSquareHeart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { CustomizationReviewPanel } from "@/components/admin/CustomizationReviewPanel";
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE_VARIANT, getAllStatusOptions } from "@/lib/order-status";

interface Props {
  params: Promise<{ id: string }>;
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

interface ProductSnapshot {
  name: string;
  sku: string;
  imageUrl: string | null;
}

export const metadata: Metadata = { title: "Order Detail" };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      payment: true,
      coupon: { select: { code: true } },
      items: true,
      customizationRequests: { include: { product: { select: { name: true } } } },
    },
  });
  if (!order) notFound();

  const address = order.addressSnapshot as unknown as AddressSnapshot;
  const isCustomized = order.customizationRequests.length > 0;
  const statusOptions = getAllStatusOptions(isCustomized);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {order.createdAt.toLocaleDateString("en-IN")} by {order.customer.name} (
            {order.customer.email})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.isRushOrder ? <Badge variant="warning">Rush</Badge> : null}
          {order.giftWrap ? <Badge variant="gold">Gift Wrapped</Badge> : null}
          <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Items</h2>
            <div className="mt-4 flex flex-col divide-y divide-border">
              {order.items.map((item) => {
                const snapshot = item.productSnapshot as unknown as ProductSnapshot;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-navy">{snapshot.name}</p>
                      <p className="font-mono text-xs text-muted">{snapshot.sku}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-navy">Qty {item.quantity}</p>
                      <p className="text-muted">₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={Number(order.subtotal)} />
              {Number(order.discountAmount) > 0 && (
                <Row label="Product Discount" value={-Number(order.discountAmount)} />
              )}
              {Number(order.couponDiscount) > 0 && (
                <Row label={`Coupon${order.coupon ? ` (${order.coupon.code})` : ""}`} value={-Number(order.couponDiscount)} />
              )}
              {order.isRushOrder && <Row label="Rush Order Fee" value={Number(order.rushFee)} />}
              {order.giftWrap && <Row label="Gift Wrap" value={Number(order.giftWrapFee)} />}
              <Row label="Delivery" value={Number(order.deliveryCharge)} />
              <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2 font-display text-navy">
                <span>Total</span>
                <span>₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.giftMessage || order.scheduledDeliveryDate || order.isRushOrder || order.giftWrap ? (
            <div className="rounded-xl border border-border bg-paper p-5">
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

          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Delivery Address</h2>
            <p className="mt-3 text-sm text-navy">
              {address.fullName}
              {address.label ? ` · ${address.label}` : ""}
            </p>
            <p className="text-sm text-muted">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.state}{" "}
              — {address.pincode}
            </p>
            <p className="text-sm text-muted">{address.phone}</p>
          </div>

          {order.customizationRequests.length > 0 ? (
            <div className="rounded-xl border border-border bg-paper p-5">
              <h2 className="font-display text-lg text-navy">Customization &amp; Design Approval</h2>
              <div className="mt-4 flex flex-col gap-6">
                {order.customizationRequests.map((request) => (
                  <CustomizationReviewPanel
                    key={request.id}
                    id={request.id}
                    productName={request.product.name}
                    status={request.status}
                    previewDesignUrl={request.previewDesignUrl}
                    customerNotes={request.customerNotes}
                    adminNotes={request.adminNotes}
                    uploadedPhotos={request.uploadedPhotos}
                    referenceDesigns={request.referenceDesigns}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <OrderStatusControl
            orderId={order.id}
            currentStatus={order.status}
            trackingNumber={order.trackingNumber}
            courierName={order.courierName}
            adminNotes={order.adminNotes}
            statusOptions={statusOptions}
          />

          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Payment</h2>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <Row label="Status" value={order.payment?.status ?? "—"} />
              <Row label="Method" value={order.payment?.method ?? "—"} />
              {order.payment?.razorpayPaymentId ? (
                <Row label="Payment ID" value={order.payment.razorpayPaymentId} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-navy">{typeof value === "number" ? `₹${value.toFixed(2)}` : value}</dd>
    </div>
  );
}
