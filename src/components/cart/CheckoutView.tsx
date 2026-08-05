"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { OrderSummary, type CartTotals } from "@/components/cart/OrderSummary";

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
        body: JSON.stringify({ addressId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Couldn't place your order.");
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
        <OrderSummary totals={totals} couponCode={couponCode} />
        {orderError ? <p className="text-sm text-error">{orderError}</p> : null}
        <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={placingOrder || !selectedId}>
          {placingOrder ? "Processing…" : "Place Order & Pay"}
        </Button>
      </div>
    </div>
  );
}
