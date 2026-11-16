import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategoryElements, getOwnDesign } from "@/lib/studio/server";
import { parseDesignDoc } from "@/lib/studio/doc";
import { CustomerStudio } from "@/components/studio/CustomerStudio";

export const metadata: Metadata = {
  title: "Design Studio",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DesignPage({ params }: Props) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) redirect(`/login?from=${encodeURIComponent(`/studio/design/${id}`)}`);

  const design = await getOwnDesign(session.sub, id);
  if (!design) notFound();

  const parsed = parseDesignDoc(design.canvas);
  if ("error" in parsed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-display text-xl text-navy">This design couldn&apos;t be opened</p>
        <p className="mt-2 text-sm text-muted">Please start a new one from the template.</p>
        <Link href={`/studio/${design.template.category.slug}`} className="mt-4 inline-block text-gold-dark underline">
          Back to templates
        </Link>
      </div>
    );
  }

  const elements = await getCategoryElements(design.template.category.id);

  return (
    <CustomerStudio
      designId={design.id}
      initialDoc={parsed.doc}
      elements={elements}
      kind={design.template.category.kind}
      templateName={design.template.name}
      sizeLabel={design.template.sizeLabel}
      price={Number(design.template.price)}
      categorySlug={design.template.category.slug}
      categoryName={design.template.category.name}
      ordered={design.status === "ORDERED"}
      inCart={design.cartItems.length > 0}
    />
  );
}
