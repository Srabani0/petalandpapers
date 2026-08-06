import { Truck, PartyPopper } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/cart";
import type { CartTotals } from "@/components/cart/OrderSummary";

export function FreeShippingProgress({ totals }: { totals: CartTotals }) {
  const amountBeforeDelivery = Math.max(
    0,
    totals.subtotal - totals.discountAmount - totals.couponDiscount,
  );
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - amountBeforeDelivery);
  const percent = Math.min(100, Math.round((amountBeforeDelivery / FREE_DELIVERY_THRESHOLD) * 100));
  const unlocked = remaining === 0;

  return (
    <div className="rounded-xl border border-border bg-paper p-4">
      <div className="flex items-center gap-2 text-sm">
        {unlocked ? (
          <PartyPopper className="h-4 w-4 shrink-0 text-sage-dark" />
        ) : (
          <Truck className="h-4 w-4 shrink-0 text-gold-dark" />
        )}
        <p className="text-navy">
          {unlocked ? (
            <span className="font-medium text-sage-dark">You&apos;ve unlocked free delivery!</span>
          ) : (
            <>
              Add <span className="font-medium text-gold-dark">₹{remaining.toFixed(2)}</span> more
              for <span className="font-medium">free delivery</span>
            </>
          )}
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
        <div
          className={unlocked ? "h-full rounded-full bg-sage transition-all" : "h-full rounded-full bg-gold transition-all"}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
