"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ORDER_STATUS_VALUES } from "@/lib/validations/order";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export function OrderStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("status") ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("status", e.target.value);
        else params.delete("status");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
    >
      <option value="">All Statuses</option>
      {ORDER_STATUS_VALUES.map((status) => (
        <option key={status} value={status}>
          {ORDER_STATUS_LABEL[status]}
        </option>
      ))}
    </select>
  );
}
