import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Palette, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Design Studio" };

export default async function AdminStudioPage() {
  const categories = await prisma.designCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      product: { select: { name: true } },
      templates: { select: { thumbnailUrl: true, isActive: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { elements: true } },
    },
  });
  const designCount = await prisma.design.count();
  const orderedCount = await prisma.design.count({ where: { status: "ORDERED" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy">Design Studio</h1>
          <p className="mt-1 text-sm text-muted">
            Categories, templates and sticker libraries for the customer design editor ·{" "}
            {designCount} customer design{designCount === 1 ? "" : "s"}, {orderedCount} ordered.
          </p>
        </div>
        <Link href="/admin/studio/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          New studio category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-paper p-10 text-center">
          <Palette className="mx-auto h-8 w-8 text-gold-dark" strokeWidth={1.5} />
          <p className="mt-3 font-display text-lg text-navy">Set up your first studio category</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            For example &ldquo;3D Miniature&rdquo; or &ldquo;Mugs&rdquo;. Then add templates (sizes) and upload stickers
            for customers to use.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const cover = c.coverImageUrl ?? c.templates.find((t) => t.thumbnailUrl)?.thumbnailUrl ?? null;
            const active = c.templates.filter((t) => t.isActive).length;
            return (
              <Link
                key={c.id}
                href={`/admin/studio/${c.id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper transition hover:border-gold"
              >
                <div className="relative aspect-[16/9] bg-[#ebe7df]">
                  {cover ? (
                    <Image src={cover} alt="" fill sizes="33vw" className="object-contain p-2" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gold-dark">
                      <Palette className="h-8 w-8" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-lg text-navy">{c.name}</p>
                    {c.isActive ? <Badge variant="success">Live</Badge> : <Badge variant="neutral">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-muted">
                    {c.kind === "MUG" ? "Mug · " : ""}
                    {active}/{c.templates.length} templates active · {c._count.elements} elements
                  </p>
                  <p className="text-xs text-muted">Ordered as: {c.product.name}</p>
                  {c.isActive && active === 0 ? (
                    <p className="text-xs text-warning">Not shown to customers until a template is active.</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
