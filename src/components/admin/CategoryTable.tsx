"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface CategoryRow {
  id: string;
  name: string;
  skuPrefix: string;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

export function CategoryTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete this category.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper p-12 text-center text-muted">
        No categories yet. Create your first one to start building the catalog.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-paper">
      {error ? <p className="border-b border-border bg-error/10 px-5 py-2 text-sm text-error">{error}</p> : null}
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-cream-dark text-left text-xs tracking-wide text-muted uppercase">
          <tr>
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">SKU Prefix</th>
            <th className="px-5 py-3">Products</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3 font-medium text-navy">{category.name}</td>
              <td className="px-5 py-3 text-muted">{category.skuPrefix}</td>
              <td className="px-5 py-3 text-muted">{category._count.products}</td>
              <td className="px-5 py-3">
                <Badge variant={category.isActive ? "success" : "neutral"}>
                  {category.isActive ? "Active" : "Hidden"}
                </Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream-dark"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deletingId === category.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-error hover:bg-error/10 disabled:opacity-50"
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
