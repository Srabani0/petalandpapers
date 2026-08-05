"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ArchiveRestore, Archive } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  price: string;
  finalPrice: string;
  discountPercent: number;
  stock: number;
  status: "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";
  category: { name: string };
}

export function ProductTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleArchiveToggle(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}/archive`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Couldn't update this product.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This can't be undone.`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete this product.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper p-12 text-center text-muted">
        No products yet. Add your first one to populate the storefront.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-paper">
      {error ? <p className="border-b border-border bg-error/10 px-5 py-2 text-sm text-error">{error}</p> : null}
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-cream-dark text-left text-xs tracking-wide text-muted uppercase">
          <tr>
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3">Price</th>
            <th className="px-5 py-3">Stock</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <p className="font-medium text-navy">{product.name}</p>
                <p className="font-mono text-xs text-muted">{product.sku}</p>
              </td>
              <td className="px-5 py-3 text-muted">{product.category.name}</td>
              <td className="px-5 py-3">
                {product.discountPercent > 0 ? (
                  <>
                    <span className="text-navy">₹{product.finalPrice}</span>{" "}
                    <span className="text-xs text-muted line-through">₹{product.price}</span>
                  </>
                ) : (
                  <span className="text-navy">₹{product.price}</span>
                )}
              </td>
              <td className="px-5 py-3 text-muted">{product.stock}</td>
              <td className="px-5 py-3">
                <Badge
                  variant={
                    product.status === "ARCHIVED"
                      ? "neutral"
                      : product.stock === 0 || product.status === "OUT_OF_STOCK"
                        ? "warning"
                        : "success"
                  }
                >
                  {product.status === "ARCHIVED"
                    ? "Archived"
                    : product.stock === 0 || product.status === "OUT_OF_STOCK"
                      ? "Out of Stock"
                      : "Active"}
                </Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream-dark"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleArchiveToggle(product.id)}
                    disabled={busyId === product.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream-dark disabled:opacity-50"
                    aria-label={product.status === "ARCHIVED" ? "Unarchive" : "Archive"}
                  >
                    {product.status === "ARCHIVED" ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={busyId === product.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-error hover:bg-error/10 disabled:opacity-50"
                    aria-label={`Delete ${product.name}`}
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
