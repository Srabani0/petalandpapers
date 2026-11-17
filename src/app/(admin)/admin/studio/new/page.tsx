import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StudioCategoryForm } from "@/components/admin/studio/StudioCategoryForm";

export const metadata: Metadata = { title: "New Studio Category" };

export default async function NewStudioCategoryPage() {
  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true, category: { select: { name: true } } },
  });

  return (
    <div className="max-w-3xl">
      <Link href="/admin/studio" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Design Studio
      </Link>
      <h1 className="mt-3 font-display text-2xl text-navy">New studio category</h1>
      <p className="mt-1 text-sm text-muted">
        A category groups templates customers can design from — e.g. 3D Miniature, Mugs, Photo Frames.
      </p>
      <div className="mt-6">
        <StudioCategoryForm
          initial={{
            name: "",
            slug: "",
            description: "",
            coverImageUrl: "",
            kind: "MINIATURE",
            productId: "",
            isActive: true,
            sortOrder: 0,
          }}
          products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, category: p.category.name }))}
        />
      </div>
    </div>
  );
}
