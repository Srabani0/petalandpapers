"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

interface CouponFormValues {
  id?: string;
  code: string;
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  expiresAt: string;
  isActive: boolean;
  applicableCategories: string[];
}

export function CouponForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: CouponFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<"PERCENTAGE" | "FLAT_AMOUNT">(initial?.type ?? "PERCENTAGE");
  const [value, setValue] = useState(initial?.value ?? 10);
  const [minOrderValue, setMinOrderValue] = useState(initial?.minOrderValue ?? 0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    initial?.maxDiscountAmount != null ? String(initial.maxDiscountAmount) : "",
  );
  const [usageLimit, setUsageLimit] = useState(initial?.usageLimit != null ? String(initial.usageLimit) : "");
  const [perUserLimit, setPerUserLimit] = useState(initial?.perUserLimit ?? 1);
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [applicableCategories, setApplicableCategories] = useState<string[]>(
    initial?.applicableCategories ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleCategory(id: string) {
    setApplicableCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(isEdit ? `/api/admin/coupons/${initial!.id}` : "/api/admin/coupons", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value,
          minOrderValue,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          perUserLimit,
          expiresAt,
          isActive,
          applicableCategories,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/coupons");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div>
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          minLength={3}
          maxLength={20}
          placeholder="e.g. WELCOME10"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="type">Discount Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FLAT_AMOUNT")}
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="PERCENTAGE">Percentage Off</option>
            <option value="FLAT_AMOUNT">Flat Amount Off</option>
          </select>
        </div>
        <div className="flex-1">
          <Label htmlFor="value">{type === "PERCENTAGE" ? "Percent Off" : "Amount Off (₹)"}</Label>
          <Input
            id="value"
            type="number"
            min={0}
            max={type === "PERCENTAGE" ? 100 : undefined}
            step="0.01"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="minOrderValue">Min. Order Value (₹)</Label>
          <Input
            id="minOrderValue"
            type="number"
            min={0}
            step="0.01"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(Number(e.target.value))}
          />
        </div>
        {type === "PERCENTAGE" ? (
          <div className="flex-1">
            <Label htmlFor="maxDiscountAmount">Max Discount Cap (₹)</Label>
            <Input
              id="maxDiscountAmount"
              type="number"
              min={0}
              step="0.01"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              placeholder="No cap"
            />
          </div>
        ) : null}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="usageLimit">Total Usage Limit</Label>
          <Input
            id="usageLimit"
            type="number"
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="perUserLimit">Per-Customer Limit</Label>
          <Input
            id="perUserLimit"
            type="number"
            min={1}
            value={perUserLimit}
            onChange={(e) => setPerUserLimit(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="expiresAt">Expires On</Label>
        <Input
          id="expiresAt"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      <div>
        <Label>Applies To</Label>
        {categories.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No categories yet.</p>
        ) : (
          <div className="mt-1 flex flex-col gap-1.5 rounded-md border border-border p-3">
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={applicableCategories.length === 0}
                onChange={() => setApplicableCategories([])}
                className="h-4 w-4 rounded border-border accent-gold"
              />
              All categories
            </label>
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={applicableCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="h-4 w-4 rounded border-border accent-gold"
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-gold"
        />
        Active
      </label>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Coupon"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/coupons")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
