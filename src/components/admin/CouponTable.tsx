"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface CouponRow {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: string;
  minOrderValue: string;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export function CouponTable({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete "${code}"? This can't be undone.`)) return;
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete this coupon.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't update this coupon.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper p-12 text-center text-muted">
        No coupons yet. Create your first offer to start driving sales.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-paper">
      {error ? <p className="border-b border-border bg-error/10 px-5 py-2 text-sm text-error">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-cream-dark text-left text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Min. Order</th>
              <th className="px-5 py-3">Usage</th>
              <th className="px-5 py-3">Expires</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
              return (
                <tr key={coupon.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-navy">{coupon.code}</td>
                  <td className="px-5 py-3 text-muted">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `₹${coupon.value} off`}
                  </td>
                  <td className="px-5 py-3 text-muted">₹{coupon.minOrderValue}</td>
                  <td className="px-5 py-3 text-muted">
                    {coupon.usedCount}
                    {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => handleToggleActive(coupon.id, coupon.isActive)} disabled={busyId === coupon.id}>
                      <Badge variant={expired ? "neutral" : coupon.isActive ? "success" : "neutral"}>
                        {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream-dark"
                        aria-label={`Edit ${coupon.code}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        disabled={busyId === coupon.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-error hover:bg-error/10 disabled:opacity-50"
                        aria-label={`Delete ${coupon.code}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
