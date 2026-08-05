"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Input";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export function OrderStatusControl({
  orderId,
  currentStatus,
  trackingNumber,
  courierName,
  adminNotes,
  availableTransitions,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  trackingNumber: string | null;
  courierName: string | null;
  adminNotes: string | null;
  availableTransitions: OrderStatus[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | "">(availableTransitions[0] ?? "");
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [courier, setCourier] = useState(courierName ?? "");
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!status) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: tracking || undefined,
          courierName: courier || undefined,
          adminNotes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't update this order.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-paper p-5">
      <h2 className="font-display text-lg text-navy">Order Status</h2>
      <p className="mt-1 text-sm text-muted">Currently: {ORDER_STATUS_LABEL[currentStatus]}</p>

      {availableTransitions.length === 0 ? (
        <p className="mt-4 text-sm text-muted">This order is in a final state.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <Label htmlFor="status">Move to</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {availableTransitions.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="courier">Courier</Label>
            <Input id="courier" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. BlueDart" />
          </div>

          <div>
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible to admins only" />
          </div>

          <FieldError>{error ?? undefined}</FieldError>

          <Button type="submit" disabled={saving || !status}>
            {saving ? "Updating…" : "Update Status"}
          </Button>
        </div>
      )}
    </form>
  );
}
