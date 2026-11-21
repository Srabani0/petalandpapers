"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { CartItemRow, type CartItemView } from "@/components/cart/CartItemRow";
import { OrderSummary, type CartTotals } from "@/components/cart/OrderSummary";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import { toCartItemView, type RawCartItem } from "@/lib/cart-view";

interface CartApiResponse {
  cart: { items: RawCartItem[]; coupon: { code: string } | null };
  totals: CartTotals;
}

export function CartView({
  initialItems,
  initialTotals,
  initialCouponCode,
}: {
  initialItems: CartItemView[];
  initialTotals: CartTotals;
  initialCouponCode: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [totals, setTotals] = useState(initialTotals);
  const [couponCode, setCouponCode] = useState(initialCouponCode);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function applyResponse(data: CartApiResponse) {
    setItems(data.cart.items.map(toCartItemView));
    setTotals(data.totals);
    setCouponCode(data.cart.coupon?.code ?? null);
  }

  async function handleQuantityChange(itemId: string, quantity: number) {
    setBusyId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (res.ok) applyResponse(data);
    } finally {
      setBusyId(null);
      router.refresh();
    }
  }

  async function handleRemove(itemId: string) {
    setBusyId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) applyResponse(data);
    } finally {
      setBusyId(null);
      router.refresh();
    }
  }

  async function handleApplyCoupon(e: FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Couldn't apply coupon.");
        return;
      }
      applyResponse(data);
      setCouponInput("");
    } catch {
      setCouponError("Couldn't reach the server. Please try again.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function handleRemoveCoupon() {
    setCouponBusy(true);
    try {
      const res = await fetch("/api/cart/coupon", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) applyResponse(data);
    } finally {
      setCouponBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <ComingSoon
        icon={ShoppingBag}
        title="Your Cart Is Empty"
        description="Browse our handcrafted collection and add something special."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FreeShippingProgress totals={totals} />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <form onSubmit={handleApplyCoupon} className="rounded-xl border border-border bg-paper p-5">
            <label className="text-sm font-medium text-navy" htmlFor="coupon">
              Have a coupon?
            </label>
            {couponCode ? (
              <div className="mt-2 flex items-center justify-between rounded-md bg-sage/10 px-3 py-2 text-sm text-sage-dark">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {couponCode}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={couponBusy}
                  aria-label="Remove coupon"
                  className="text-sage-dark hover:opacity-70 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  className="flex-1"
                />
                <Button type="submit" variant="outline" disabled={couponBusy}>
                  Apply
                </Button>
              </div>
            )}
            {couponError ? <p className="mt-1.5 text-sm text-error">{couponError}</p> : null}
          </form>

          <OrderSummary totals={totals} couponCode={couponCode} />

          <Button size="lg" className="hidden w-full lg:flex" onClick={() => router.push("/checkout")}>
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Phones: checkout bar pinned to the bottom, like a shopping app. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_24px_-18px_rgba(30,42,74,0.45)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Total</p>
            <p className="font-display text-xl leading-tight text-navy">₹{totals.totalAmount.toFixed(2)}</p>
          </div>
          <Button size="lg" className="shrink-0" onClick={() => router.push("/checkout")}>
            Checkout
          </Button>
        </div>
      </div>
      <div aria-hidden className="h-16 lg:hidden" />
    </div>
  );
}
