import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminTemplateStudio } from "@/components/admin/studio/AdminTemplateStudio";

export const metadata: Metadata = { title: "New Template" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewTemplatePage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.designCategory.findUnique({
    where: { id },
    include: {
      elements: {
        orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
        select: { id: true, name: true, group: true, imageUrl: true },
      },
    },
  });
  if (!category) notFound();

  return (
    <AdminTemplateStudio
      templateId={null}
      categoryId={category.id}
      categoryName={category.name}
      kind={category.kind}
      elements={category.elements}
      initialMeta={{ name: "", sizeLabel: "", width: 900, height: 1200, price: "", isActive: true, sortOrder: 0 }}
      initialDoc={null}
    />
  );
}
