import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Truck } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { TemplatePicker, type PickerTemplate } from "@/components/studio/TemplatePicker";
import { getStudioCategory } from "@/lib/studio/server";
import { parseDesignDoc } from "@/lib/studio/doc";
import { getCurrentUser } from "@/lib/auth/session";
import { truncate } from "@/lib/seo/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getStudioCategory(slug);
  if (!category) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: `Customize Your ${category.name} – All Designs & Sizes`,
    description: truncate(
      category.description ||
        `Personalize a ${category.name.toLowerCase()} online with your own photos, names and messages. Pick a design and size, preview it in 3D, and we'll handcraft it.`,
    ),
    alternates: { canonical: `/studio/${category.slug}` },
  };
}

export default async function StudioCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, session] = await Promise.all([getStudioCategory(slug), getCurrentUser()]);
  if (!category) notFound();

  const templates: PickerTemplate[] = category.templates.map((t) => {
    const parsed = parseDesignDoc(t.canvas);
    return {
      id: t.id,
      name: t.name,
      sizeLabel: t.sizeLabel,
      width: t.width,
      height: t.height,
      price: Number(t.price),
      thumbnailUrl: t.thumbnailUrl,
      doc: "doc" in parsed ? parsed.doc : null,
    };
  });

  return (
    <Section>
      <Container>
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/studio" className="hover:text-gold-dark">
            Customize
          </Link>
          {" / "}
          <span className="text-navy">{category.name}</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="font-display text-3xl text-navy sm:text-4xl">{category.name}</h1>
          <p className="mt-3 leading-relaxed text-muted">
            {category.description ||
              "Pick a design and a size. Every frame, text and sticker can be changed in the editor."}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy">
            <span className="inline-flex items-center gap-2">
              <Box className="h-4 w-4 text-gold-dark" /> See it in 3D before you order
            </span>
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold-dark" /> Handcrafted and delivered in {category.product.deliveryTime}
            </span>
          </div>
        </header>

        {templates.length === 0 ? (
          <p className="mt-12 rounded-xl border border-dashed border-border p-10 text-center text-muted">
            Designs for this category are coming soon.
          </p>
        ) : (
          <TemplatePicker
            templates={templates}
            kind={category.kind}
            signedIn={Boolean(session)}
            returnTo={`/studio/${category.slug}`}
          />
        )}
      </Container>
    </Section>
  );
}
