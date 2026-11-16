import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Palette, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { StudioCategoryForm } from "@/components/admin/studio/StudioCategoryForm";
import { ElementsManager } from "@/components/admin/studio/ElementsManager";
import { DeleteTemplateButton } from "@/components/admin/studio/DeleteTemplateButton";

export const metadata: Metadata = { title: "Studio Category" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminStudioCategoryPage({ params }: Props) {
  const { id } = await params;
  const [category, products] = await Promise.all([
    prisma.designCategory.findUnique({
      where: { id },
      include: {
        templates: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: { _count: { select: { designs: true } } },
        },
        elements: {
          orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
          select: { id: true, name: true, group: true, imageUrl: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, category: { select: { name: true } } },
    }),
  ]);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin/studio" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
          <ArrowLeft className="h-4 w-4" /> Design Studio
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-navy">{category.name}</h1>
          <Link
            href={`/studio/${category.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:underline"
          >
            View as customer <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-navy">Templates</h2>
            <p className="text-sm text-muted">Each template is one size/layout customers can start from, with its own price.</p>
          </div>
          <Link href={`/admin/studio/${category.id}/templates/new`} className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" /> New template
          </Link>
        </div>

        {category.templates.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted">
            No templates yet. Create one to make this category available to customers.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.templates.map((t) => (
              <article key={t.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper">
                <Link href={`/admin/studio/templates/${t.id}`} className="relative block aspect-square bg-[#ebe7df]">
                  {t.thumbnailUrl ? (
                    <Image src={t.thumbnailUrl} alt={t.name} fill sizes="25vw" className="object-contain p-2" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-gold-dark">
                      <Palette className="h-8 w-8" strokeWidth={1.25} />
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-navy">{t.name}</p>
                    {t.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-muted">
                    {t.sizeLabel} · ₹{Number(t.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted">{t._count.designs} customer design(s)</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <Link
                      href={`/admin/studio/templates/${t.id}`}
                      className="inline-flex items-center gap-1 text-sm text-gold-dark hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <DeleteTemplateButton templateId={t.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl text-navy">Elements library</h2>
        <p className="mb-4 text-sm text-muted">Stickers and props customers can add to designs in this category.</p>
        <ElementsManager categoryId={category.id} elements={category.elements} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl text-navy">Category settings</h2>
        <StudioCategoryForm
          initial={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            coverImageUrl: category.coverImageUrl ?? "",
            kind: category.kind,
            productId: category.productId,
            isActive: category.isActive,
            sortOrder: category.sortOrder,
          }}
          products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, category: p.category.name }))}
        />
      </section>
    </div>
  );
}
