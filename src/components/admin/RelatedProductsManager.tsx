"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

export interface RelatedProductOption {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
}

export function RelatedProductsManager({
  productId,
  allProducts,
  initialSelectedIds,
}: {
  productId: string;
  allProducts: RelatedProductOption[];
  initialSelectedIds: string[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(allProducts.map((p) => [p.id, p])), [allProducts]);
  const selectedProducts = selectedIds.map((id) => byId.get(id)).filter((p): p is RelatedProductOption => Boolean(p));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) => !selectedIds.includes(p.id))
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, allProducts, selectedIds]);

  function addProduct(id: string) {
    setSelectedIds((prev) => [...prev, id]);
    setQuery("");
    setSaved(false);
  }

  function removeProduct(id: string) {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/related`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedProducts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-border bg-paper py-1 pr-3 pl-1 text-sm"
            >
              <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-cream-dark">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt="" fill sizes="24px" className="object-cover" />
                ) : null}
              </span>
              <span className="text-navy">{p.name}</span>
              <button
                type="button"
                onClick={() => removeProduct(p.id)}
                aria-label={`Remove ${p.name}`}
                className="text-muted hover:text-error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          No related products chosen yet — the storefront will automatically show other products
          from the same category instead.
        </p>
      )}

      <div className="relative max-w-sm">
        <Label htmlFor="related-search">Add a product</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="related-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU…"
            className="pl-9"
            autoComplete="off"
          />
        </div>
        {results.length > 0 ? (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-paper shadow-lg">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProduct(p.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-cream-dark"
              >
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-cream-dark">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt="" fill sizes="28px" className="object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-navy">{p.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted">{p.sku}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="self-start">
          {saving ? "Saving…" : "Save Related Products"}
        </Button>
        {saved ? <span className="text-sm text-muted">Saved.</span> : null}
      </div>
    </div>
  );
}
