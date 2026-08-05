"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface CategoryOption {
  slug: string;
  name: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ShopFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const timeout = setTimeout(() => updateParams({ q: query || undefined }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateParams({ category: e.target.value || undefined })}
          className="rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={searchParams.get("customizable") === "true"}
            onChange={(e) => updateParams({ customizable: e.target.checked ? "true" : undefined })}
            className="h-4 w-4 rounded border-border accent-gold"
          />
          Customizable only
        </label>
      </div>
    </div>
  );
}
