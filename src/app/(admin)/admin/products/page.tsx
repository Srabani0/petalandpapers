import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/Button";
import { ProductTable } from "@/components/admin/ProductTable";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: p.price.toFixed(2),
    finalPrice: p.finalPrice.toFixed(2),
    discountPercent: p.discountPercent,
    stock: p.stock,
    status: p.status,
    category: p.category,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy">Products</h1>
          <p className="mt-1 text-sm text-muted">Manage what customers see in the shop.</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      <div className="mt-6">
        <ProductTable products={rows} />
      </div>
    </div>
  );
}
