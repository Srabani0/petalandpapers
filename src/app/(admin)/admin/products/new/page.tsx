import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">New Product</h1>
      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-error">
          Create a category first — products need one to generate their SKU.
        </p>
      ) : null}
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
