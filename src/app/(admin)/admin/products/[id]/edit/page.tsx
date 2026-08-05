import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import { CustomizationFormBuilder } from "@/components/admin/CustomizationFormBuilder";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        customizationForm: { include: { fields: { orderBy: { sortOrder: "asc" } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Edit Product</h1>

      <div className="mt-6">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            price: Number(product.price),
            discountPercent: product.discountPercent,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            deliveryTime: product.deliveryTime,
            isCustomizable: product.isCustomizable,
            requiresApproval: product.requiresApproval,
            minPhotos: product.minPhotos,
            maxPhotos: product.maxPhotos,
            videoUrl: product.videoUrl ?? "",
          }}
        />
      </div>

      <div className="mt-10 max-w-2xl border-t border-border pt-8">
        <h2 className="font-display text-lg text-navy">Photos</h2>
        <p className="mt-1 text-sm text-muted">
          The first photo uploaded becomes the primary image shown on listing cards.
        </p>
        <div className="mt-4">
          <ProductImageManager productId={product.id} images={product.images} />
        </div>
      </div>

      {product.isCustomizable && (
        <div className="mt-10 max-w-2xl border-t border-border pt-8">
          <h2 className="font-display text-lg text-navy">Customization Form</h2>
          <p className="mt-1 text-sm text-muted">
            Define what you need from the customer for this product — this is what
            they&apos;ll fill out before adding it to cart.
          </p>
          <div className="mt-4">
            <CustomizationFormBuilder
              productId={product.id}
              initial={
                product.customizationForm
                  ? {
                      title: product.customizationForm.title,
                      description: product.customizationForm.description ?? "",
                      fields: product.customizationForm.fields.map((field) => ({
                        key: field.id,
                        id: field.id,
                        label: field.label,
                        fieldType: field.fieldType,
                        placeholder: field.placeholder ?? "",
                        isRequired: field.isRequired,
                        options: Array.isArray(field.options)
                          ? (field.options as string[]).join(", ")
                          : "",
                        minValue: field.minValue ?? "",
                        maxValue: field.maxValue ?? "",
                      })),
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
