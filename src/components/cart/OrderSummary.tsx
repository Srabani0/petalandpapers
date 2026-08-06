import { FREE_DELIVERY_THRESHOLD } from "@/lib/cart";

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  couponDiscount: number;
  deliveryCharge: number;
  totalAmount: number;
}

export function OrderSummary({
  totals,
  couponCode,
  extraRows,
}: {
  totals: CartTotals;
  couponCode?: string | null;
  extraRows?: { label: string; value: number }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-paper p-5">
      <h2 className="font-display text-lg text-navy">Order Summary</h2>

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <Row label="Subtotal" value={totals.subtotal} />
        {totals.discountAmount > 0 && (
          <Row label="Product Discount" value={-totals.discountAmount} tone="sage" />
        )}
        {totals.couponDiscount > 0 && (
          <Row label={couponCode ? `Coupon (${couponCode})` : "Coupon"} value={-totals.couponDiscount} tone="sage" />
        )}
        {extraRows?.map((row) => <Row key={row.label} label={row.label} value={row.value} />)}
        <Row
          label="Delivery"
          value={totals.deliveryCharge}
          hint={
            totals.deliveryCharge === 0
              ? "Free"
              : `Free above ₹${FREE_DELIVERY_THRESHOLD}`
          }
        />
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="font-display text-base text-navy">Total</span>
        <span className="font-display text-xl text-navy">₹{totals.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone?: "sage";
  hint?: string;
}) {
  const isFree = hint === "Free";
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={tone === "sage" ? "text-sage-dark" : "text-navy"}>
        {isFree ? (
          <span className="text-sage-dark">Free</span>
        ) : (
          <>
            {value < 0 ? "-" : ""}₹{Math.abs(value).toFixed(2)}
          </>
        )}
      </dd>
    </div>
  );
}
