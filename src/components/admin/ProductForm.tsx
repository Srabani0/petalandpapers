"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError, FieldHint } from "@/components/ui/Input";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormValues {
  id?: string;
  sku?: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  discountPercent: number;
  stock: number;
  lowStockThreshold: number;
  deliveryTime: string;
  isCustomizable: boolean;
  requiresApproval: boolean;
  minPhotos: number | null;
  maxPhotos: number | null;
  videoUrl: string;
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discountPercent, setDiscountPercent] = useState(initial?.discountPercent ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial?.lowStockThreshold ?? 5);
  const [deliveryTime, setDeliveryTime] = useState(initial?.deliveryTime ?? "5-7 business days");
  const [isCustomizable, setIsCustomizable] = useState(initial?.isCustomizable ?? false);
  const [requiresApproval, setRequiresApproval] = useState(initial?.requiresApproval ?? false);
  const [minPhotos, setMinPhotos] = useState(initial?.minPhotos ?? 1);
  const [maxPhotos, setMaxPhotos] = useState(initial?.maxPhotos ?? 5);
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      description,
      categoryId,
      price,
      discountPercent,
      stock,
      lowStockThreshold,
      deliveryTime,
      isCustomizable,
      requiresApproval: isCustomizable ? requiresApproval : false,
      minPhotos: isCustomizable ? minPhotos : null,
      maxPhotos: isCustomizable ? maxPhotos : null,
      videoUrl,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/products/${data.product.id}/edit`);
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      {initial?.sku ? (
        <div>
          <Label>SKU</Label>
          <p className="font-mono text-sm text-navy">{initial.sku}</p>
        </div>
      ) : null}

      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
        />
      </div>

      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {categories.length === 0 && <option value="">No categories yet</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="discountPercent">Discount %</Label>
          <Input
            id="discountPercent"
            type="number"
            min={0}
            max={100}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="lowStockThreshold">Low Stock Alert At</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min={0}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="deliveryTime">Delivery Time</Label>
        <Input
          id="deliveryTime"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          placeholder="e.g. 5-7 business days"
          required
        />
      </div>

      <div>
        <Label htmlFor="videoUrl">Video URL (optional)</Label>
        <Input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="rounded-lg border border-border bg-cream-dark/60 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          <input
            type="checkbox"
            checked={isCustomizable}
            onChange={(e) => setIsCustomizable(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-gold"
          />
          This product is customizable
        </label>
        <FieldHint>
          The dynamic customization form builder for this product is built in the
          next phase — this just flags it as customizable for now.
        </FieldHint>

        {isCustomizable && (
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-gold"
              />
              Requires design approval before production
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="minPhotos">Min Photos</Label>
                <Input
                  id="minPhotos"
                  type="number"
                  min={0}
                  value={minPhotos}
                  onChange={(e) => setMinPhotos(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maxPhotos">Max Photos</Label>
                <Input
                  id="maxPhotos"
                  type="number"
                  min={0}
                  value={maxPhotos}
                  onChange={(e) => setMaxPhotos(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={loading || categories.length === 0}>
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
