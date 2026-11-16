import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Palette, Truck } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { StartDesignButton } from "@/components/studio/StartDesignButton";
import { getStudioCategory } from "@/lib/studio/server";
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
    title: `Design Your Own ${category.name} – Personalized Online`,
    description: truncate(
      category.description ||
        `Customize a ${category.name.toLowerCase()} online with your own photos, names and messages. Pick a template, design it your way, and we'll handcraft it.`,
    ),
    alternates: { canonical: `/studio/${category.slug}` },
  };
}

export default async function StudioCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, session] = await Promise.all([getStudioCategory(slug), getCurrentUser()]);
  if (!category) notFound();

  return (
    <Section>
      <Container>
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/studio" className="hover:text-gold-dark">
            Design Studio
          </Link>
          {" / "}
          <span className="text-navy">{category.name}</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="font-display text-3xl text-navy sm:text-4xl">Design your {category.name}</h1>
          <p className="mt-3 leading-relaxed text-muted">
            {category.description ||
              "Choose a template and size below. Every frame, text and sticker can be changed in the editor."}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-navy">
            <Truck className="h-4 w-4 text-gold-dark" />
            Handcrafted and delivered in {category.product.deliveryTime}
          </p>
        </header>

        {category.templates.length === 0 ? (
          <p className="mt-12 rounded-xl border border-dashed border-border p-10 text-center text-muted">
            Templates for this category are coming soon.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.templates.map((t) => (
              <article key={t.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper">
                <div
                  className="relative bg-[#ebe7df]"
                  style={{ aspectRatio: `${Math.max(t.width / t.height, 0.6)}` }}
                >
                  {t.thumbnailUrl ? (
                    <Image
                      src={t.thumbnailUrl}
                      alt={`${t.name} template`}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gold-dark">
                      <Palette className="h-10 w-10" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h2 className="font-display text-lg text-navy">{t.name}</h2>
                  <p className="text-sm text-muted">{t.sizeLabel}</p>
                  <p className="mt-1 font-display text-xl text-navy">₹{Number(t.price).toFixed(2)}</p>
                  <StartDesignButton
                    templateId={t.id}
                    signedIn={Boolean(session)}
                    returnTo={`/studio/${category.slug}`}
                    className="mt-auto pt-3"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
