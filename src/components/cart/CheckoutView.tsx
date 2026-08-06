"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Gift, Zap, CalendarHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { RUSH_ORDER_FEE, GIFT_WRAP_FEE } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError, FieldHint } from "@/components/ui/Input";
import { OrderSummary, type CartTotals } from "@/components/cart/OrderSummary";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";

export interface AddressView {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutView({
  addresses,
  totals,
  couponCode,
}: {
  addresses: AddressView[];
  totals: CartTotals;
  couponCode: string | null;
}) {
  const router = useRouter();
  const [addressList, setAddressList] = useState(addresses);
  const [selectedId, setSelectedId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  );
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");

  const [giftMessage, setGiftMessage] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [isRushOrder, setIsRushOrder] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const minDeliveryDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }, []);
  const displayTotals = useMemo(
    () => ({
      ...totals,
      totalAmount:
        totals.totalAmount + (isRushOrder ? RUSH_ORDER_FEE : 0) + (giftWrap ? GIFT_WRAP_FEE : 0),
    }),
    [totals, isRushOrder, giftWrap],
  );
  const extraRows = [
    ...(isRushOrder ? [{ label: "Rush Order Fee", value: RUSH_ORDER_FEE }] : []),
    ...(giftWrap ? [{ label: "Gift Wrap", value: GIFT_WRAP_FEE }] : []),
  ];

  const [label, setLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  async function handleAddAddress(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSavingAddress(true);
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          label,
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
          isDefault: addressList.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Couldn't save this address.");
        return;
      }
      setAddressList((prev) => [data.address, ...prev]);
      setSelectedId(data.address.id);
      setShowForm(false);
      setLabel("");
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPincode("");
    } catch {
      setFormError("Couldn't reach the server. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function verifyPayment(orderId: string, payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) {
      setOrderError(data.error ?? "Payment couldn't be verified.");
      return;
    }
    router.push(`/order-confirmation/${orderId}`);
  }

  async function handlePlaceOrder() {
    if (!selectedId) {
      setOrderError("Please select or add a delivery address.");
      return;
    }
    setOrderError(null);
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          addressId: selectedId,
          paymentMethod,
          giftMessage: giftMessage.trim() || undefined,
          scheduledDeliveryDate: scheduledDeliveryDate || undefined,
          isRushOrder,
          giftWrap,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Couldn't place your order.");
        return;
      }

      if (data.cod) {
        router.push(`/order-confirmation/${data.orderId}`);
        return;
      }

      if (data.mock) {
        await verifyPayment(data.orderId, {
          razorpayOrderId: data.mockPayment.razorpayOrderId,
          razorpayPaymentId: data.mockPayment.razorpayPaymentId,
          razorpaySignature: data.mockPayment.signature,
        });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setOrderError("Couldn't load the payment gateway. Please try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: "Petal & Papers",
        order_id: data.razorpay.razorpayOrderId,
        handler: (response) => {
          void verifyPayment(data.orderId, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: { ondismiss: () => setPlacingOrder(false) },
      });
      razorpay.open();
      return;
    } catch {
      setOrderError("Couldn't reach the server. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-navy">Delivery Address</h2>

        {addressList.length > 0 ? (
          <div className="flex flex-col gap-3">
            {addressList.map((addr) => (
              <label
                key={addr.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
                  selectedId === addr.id ? "border-gold bg-gold/5" : "border-border bg-paper",
                )}
              >
                <input
                  type="radio"
                  name="address"
                  className="mt-1 accent-gold"
                  checked={selectedId === addr.id}
                  onChange={() => setSelectedId(addr.id)}
                />
                <div>
                  <p className="font-medium text-navy">
                    {addr.fullName}
                    {addr.label ? ` · ${addr.label}` : ""}
                    {addr.isDefault ? <span className="ml-2 text-xs text-gold-dark">Default</span> : null}
                  </p>
                  <p className="text-muted">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} —{" "}
                    {addr.pincode}
                  </p>
                  <p className="text-muted">{addr.phone}</p>
                </div>
              </label>
            ))}
          </div>
        ) : null}

        {showForm ? (
          <form
            onSubmit={handleAddAddress}
            className="flex flex-col gap-4 rounded-xl border border-border bg-paper p-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required minLength={3} />
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
              <Input id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required minLength={2} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required minLength={2} />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required pattern="\d{6}" />
              </div>
            </div>

            <div>
              <Label htmlFor="label">Label (optional)</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home, Work…" />
            </div>

            <FieldError>{formError ?? undefined}</FieldError>

            <div className="flex gap-3">
              <Button type="submit" disabled={savingAddress}>
                {savingAddress ? "Saving…" : "Save Address"}
              </Button>
              {addressList.length > 0 ? (
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        ) : (
          <Button type="button" variant="outline" onClick={() => setShowForm(true)} className="self-start">
            <Plus className="h-4 w-4" />
            Add New Address
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <FreeShippingProgress totals={totals} />

        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Make It Special</h2>

          <div className="mt-3">
            <Label htmlFor="giftMessage">Gift message (optional)</Label>
            <Textarea
              id="giftMessage"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value.slice(0, 300))}
              placeholder="Write a note to go with this gift…"
              rows={3}
            />
            <FieldHint>{300 - giftMessage.length} characters left</FieldHint>
          </div>

          <div className="mt-4">
            <Label htmlFor="scheduledDeliveryDate">
              <CalendarHeart className="mr-1 inline h-3.5 w-3.5" />
              Deliver on a specific date (optional)
            </Label>
            <Input
              id="scheduledDeliveryDate"
              type="date"
              min={minDeliveryDate}
              value={scheduledDeliveryDate}
              onChange={(e) => setScheduledDeliveryDate(e.target.value)}
              className="max-w-[200px]"
            />
            <FieldHint>Perfect for birthdays and anniversaries.</FieldHint>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                isRushOrder ? "border-gold bg-gold/5" : "border-border",
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-gold"
                checked={isRushOrder}
                onChange={(e) => setIsRushOrder(e.target.checked)}
              />
              <span className="flex-1">
                <span className="flex items-center gap-1.5 font-medium text-navy">
                  <Zap className="h-3.5 w-3.5 text-gold-dark" />
                  Rush my order (+₹{RUSH_ORDER_FEE})
                </span>
                <span className="block text-xs text-muted">Priority production &amp; faster turnaround</span>
              </span>
            </label>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                giftWrap ? "border-gold bg-gold/5" : "border-border",
              )}
            >
              <input
                type="checkbox"
                className="accent-gold"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
              />
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gold-light shadow-inner">
                <span className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-navy/80" />
                <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-navy/80" />
                <span className="absolute top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-1.5 font-medium text-navy">
                  <Gift className="h-3.5 w-3.5 text-gold-dark" />
                  Add gift wrap (+₹{GIFT_WRAP_FEE})
                </span>
                <span className="block text-xs text-muted">Wrapped in our signature paper &amp; ribbon</span>
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Payment Method</h2>
          <div className="mt-3 flex flex-col gap-2">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                paymentMethod === "ONLINE" ? "border-gold bg-gold/5" : "border-border",
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="accent-gold"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />
              <span>
                <span className="block font-medium text-navy">Pay Online</span>
                <span className="block text-xs text-muted">UPI, card, net banking or wallet</span>
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                paymentMethod === "COD" ? "border-gold bg-gold/5" : "border-border",
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="accent-gold"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span>
                <span className="block font-medium text-navy">Cash on Delivery</span>
                <span className="block text-xs text-muted">Pay in cash when your order arrives</span>
              </span>
            </label>
          </div>
        </div>

        <OrderSummary totals={displayTotals} couponCode={couponCode} extraRows={extraRows} />
        {orderError ? <p className="text-sm text-error">{orderError}</p> : null}
        <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={placingOrder || !selectedId}>
          {placingOrder
            ? "Processing…"
            : paymentMethod === "COD"
              ? "Place Order (Cash on Delivery)"
              : "Place Order & Pay"}
        </Button>
      </div>
    </div>
  );
}
