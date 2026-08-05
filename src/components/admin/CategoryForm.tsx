"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { slugify } from "@/lib/slug";

interface CategoryFormValues {
  id?: string;
  name: string;
  skuPrefix: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export function CategoryForm({ initial }: { initial?: CategoryFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [skuPrefix, setSkuPrefix] = useState(initial?.skuPrefix ?? "");
  const [prefixTouched, setPrefixTouched] = useState(isEdit);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!prefixTouched) {
      setSkuPrefix(slugify(value).replace(/-/g, "").slice(0, 6).toUpperCase());
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        isEdit ? `/api/admin/categories/${initial!.id}` : "/api/admin/categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name,
            skuPrefix,
            description,
            imageUrl,
            isActive,
            sortOrder,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          minLength={2}
        />
      </div>

      <div>
        <Label htmlFor="skuPrefix">SKU Prefix</Label>
        <Input
          id="skuPrefix"
          value={skuPrefix}
          onChange={(e) => {
            setPrefixTouched(true);
            setSkuPrefix(e.target.value.toUpperCase());
          }}
          required
          minLength={2}
          maxLength={10}
          placeholder="e.g. SCRAP"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Banner Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-6">
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-gold"
          />
          Active (visible to customers)
        </label>
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
