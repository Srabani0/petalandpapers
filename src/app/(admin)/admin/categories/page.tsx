import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/Button";
import { CategoryTable } from "@/components/admin/CategoryTable";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy">Categories</h1>
          <p className="mt-1 text-sm text-muted">Organize the catalog customers browse.</p>
        </div>
        <Link href="/admin/categories/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          New Category
        </Link>
      </div>

      <div className="mt-6">
        <CategoryTable categories={categories} />
      </div>
    </div>
  );
}
