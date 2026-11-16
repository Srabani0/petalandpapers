import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseDesignDoc } from "@/lib/studio/doc";
import { AdminTemplateStudio } from "@/components/admin/studio/AdminTemplateStudio";

export const metadata: Metadata = { title: "Edit Template" };

interface Props {
  params: Promise<{ templateId: string }>;
}

export default async function EditTemplatePage({ params }: Props) {
  const { templateId } = await params;
  const template = await prisma.designTemplate.findUnique({
    where: { id: templateId },
    include: {
      category: {
        include: {
          elements: {
            orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
            select: { id: true, name: true, group: true, imageUrl: true },
          },
        },
      },
    },
  });
  if (!template) notFound();

  const parsed = parseDesignDoc(template.canvas);
  if ("error" in parsed) {
    return (
      <div className="rounded-xl border border-border bg-paper p-6">
        <p className="font-display text-lg text-navy">This template&apos;s canvas couldn&apos;t be read</p>
        <p className="mt-1 text-sm text-muted">{parsed.error}</p>
        <Link href={`/admin/studio/${template.categoryId}`} className="mt-3 inline-block text-gold-dark underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <AdminTemplateStudio
      templateId={template.id}
      categoryId={template.categoryId}
      categoryName={template.category.name}
      kind={template.category.kind}
      elements={template.category.elements}
      initialMeta={{
        name: template.name,
        sizeLabel: template.sizeLabel,
        width: template.width,
        height: template.height,
        price: Number(template.price).toFixed(2),
        isActive: template.isActive,
        sortOrder: template.sortOrder,
      }}
      initialDoc={parsed.doc}
    />
  );
}
