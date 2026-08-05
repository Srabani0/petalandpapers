import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CustomizationForm } from "@/components/customize/CustomizationForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Customize Your Gift" };

export default async function CustomizePage({ params }: Props) {
  const { id } = await params;

  const session = await getCurrentUser();
  if (!session) {
    redirect(`/login?from=${encodeURIComponent(`/product/${id}/customize`)}`);
  }

  const product = await prisma.product.findFirst({
    where: { id, status: { not: "ARCHIVED" } },
    include: { customizationForm: { include: { fields: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!product) notFound();
  if (!product.isCustomizable) redirect(`/product/${id}`);

  const form = product.customizationForm;

  return (
    <Section>
      <Container className="max-w-2xl">
        <Link
          href={`/product/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {product.name}
        </Link>

        <div className="mt-6 rounded-xl border border-border bg-paper p-6 sm:p-8">
          {!form || form.fields.length === 0 ? (
            <p className="text-center text-muted">
              This product&apos;s customization form isn&apos;t ready yet — please check back
              soon.
            </p>
          ) : (
            <CustomizationForm
              productId={product.id}
              productName={product.name}
              formTitle={form.title}
              formDescription={form.description}
              fields={form.fields.map((field) => ({
                id: field.id,
                label: field.label,
                fieldType: field.fieldType,
                isRequired: field.isRequired,
                options: Array.isArray(field.options) ? (field.options as string[]) : null,
                minValue: field.minValue,
                maxValue: field.maxValue,
                placeholder: field.placeholder,
              }))}
              minPhotos={product.minPhotos ?? 0}
              maxPhotos={product.maxPhotos ?? 10}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
