import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Edit Category</h1>
      <div className="mt-6">
        <CategoryForm
          initial={{
            id: category.id,
            name: category.name,
            skuPrefix: category.skuPrefix,
            description: category.description ?? "",
            imageUrl: category.imageUrl ?? "",
            isActive: category.isActive,
            sortOrder: category.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
