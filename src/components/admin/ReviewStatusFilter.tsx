"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STATUSES = [
  { value: "", label: "All Reviews" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "HIDDEN", label: "Hidden" },
];

export function ReviewStatusFilter() {
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
      {STATUSES.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
