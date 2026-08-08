"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

export interface AdjustableProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export function StockAdjustmentForm({ products }: { products: AdjustableProduct[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantityChange, setQuantityChange] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = products.find((p) => p.id === productId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productId || quantityChange === 0) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantityChange, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't adjust stock.");
        return;
      }
      setReason("");
      setQuantityChange(1);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="product">Product</Label>
        <select
          id="product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm text-navy focus:border-gold focus:outline-none"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) — {p.stock} in stock
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="quantityChange">
            {quantityChange >= 0 ? "Quantity to Add" : "Quantity to Remove"}
          </Label>
          <Input
            id="quantityChange"
            type="number"
            value={quantityChange}
            onChange={(e) => setQuantityChange(Number(e.target.value))}
            required
          />
        </div>
        {selected ? (
          <div className="flex-1">
            <Label>Stock After</Label>
            <p className="flex h-10 items-center text-sm text-navy">
              {selected.stock} → {Math.max(0, selected.stock + quantityChange)}
            </p>
          </div>
        ) : null}
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. New stock received, damaged units removed"
          required
          minLength={3}
        />
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" disabled={busy || !productId} className="self-start">
        {busy ? "Saving…" : "Adjust Stock"}
      </Button>
    </form>
  );
}
