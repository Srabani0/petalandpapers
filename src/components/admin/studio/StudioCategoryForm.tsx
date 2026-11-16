"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError, FieldHint } from "@/components/ui/Input";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";

export interface StudioCategoryValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  kind: "STANDARD" | "MUG";
  productId: string;
  isActive: boolean;
  sortOrder: number;
}

const selectClasses =
  "w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function StudioCategoryForm({
  initial,
  products,
}: {
  initial: StudioCategoryValues;
  products: { id: string; name: string; sku: string; category: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEdit = Boolean(initial.id);

  const set = <K extends keyof StudioCategoryValues>(key: K, value: StudioCategoryValues[K]) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/studio/categories/${initial.id}` : "/api/admin/studio/categories", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, id: undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't save.");
        return;
      }
      if (isEdit) {
        setSaved(true);
        router.refresh();
      } else {
        router.push(`/admin/studio/${data.category.id}`);
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/categories/${initial.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete.");
        setConfirmDelete(false);
        return;
      }
      router.push("/admin/studio");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-paper p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-name">Name</Label>
          <Input
            id="sc-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="3D Miniature"
            required
          />
        </div>
        <div>
          <Label htmlFor="sc-slug">URL slug</Label>
          <Input
            id="sc-slug"
            value={values.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase())}
            placeholder="auto from name"
          />
          <FieldHint>Page address: /studio/{values.slug || "…"}</FieldHint>
        </div>
      </div>

      <div>
        <Label htmlFor="sc-desc">Description</Label>
        <Textarea
          id="sc-desc"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Shown to customers above the templates."
          maxLength={600}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-kind">Type</Label>
          <select
            id="sc-kind"
            value={values.kind}
            onChange={(e) => set("kind", e.target.value as "STANDARD" | "MUG")}
            className={selectClasses}
          >
            <option value="STANDARD">Standard (miniatures, frames, scrapbooks…)</option>
            <option value="MUG">Mug — shows a 3D mug preview</option>
          </select>
        </div>
        <div>
          <Label htmlFor="sc-product">Ordered as product</Label>
          <select
            id="sc-product"
            value={values.productId}
            onChange={(e) => set("productId", e.target.value)}
            className={selectClasses}
            required
          >
            <option value="">Choose a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — {p.category}
              </option>
            ))}
          </select>
          <FieldHint>
            Orders are recorded against this product (delivery time, category coupons). The price charged is each
            template&apos;s own price.
          </FieldHint>
        </div>
      </div>

      <SingleImageUpload
        label="Cover image (optional — defaults to the first template's thumbnail)"
        value={values.coverImageUrl}
        onChange={(url) => set("coverImageUrl", url)}
        uploadEndpoint="/api/admin/studio/uploads"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-sort">Sort order</Label>
          <Input
            id="sc-sort"
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-navy">
          <input type="checkbox" checked={values.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          Active — visible to customers
        </label>
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Create category"}
          </Button>
          {saved ? <span className="text-sm text-success">Saved.</span> : null}
        </div>
        {isEdit ? (
          confirmDelete ? (
            <span className="flex items-center gap-2 text-sm">
              Delete this category and its templates?
              <Button type="button" size="sm" variant="destructive" onClick={handleDelete} disabled={saving}>
                Delete
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )
        ) : null}
      </div>
    </form>
  );
}
