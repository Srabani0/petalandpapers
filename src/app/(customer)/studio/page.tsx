import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryCover } from "@/components/studio/CategoryCover";
import { listStudioCategories } from "@/lib/studio/server";
import { BOUQUET_CATEGORY_SLUG } from "@/lib/studio/bouquet";
import { parseDesignDoc } from "@/lib/studio/doc";

export const metadata: Metadata = {
  title: "Customize Your Gift – 3D Miniatures, Mugs, Frames & Bouquets",
  description:
    "Design your own personalized gift online: choose a 3D miniature, mug, photo frame or bouquet, add your photos and words, see it in 3D, and we'll handcraft it. Delivered across India.",
  alternates: { canonical: "/studio" },
};

// Catalogue changes when the admin publishes templates — keep it fresh.
export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const categories = await listStudioCategories();

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Customize"
          title="What would you like to create?"
          description="Choose a category to see every design and size."
        />

        {categories.length === 0 ? (
          <p className="mx-auto mt-14 max-w-md rounded-xl border border-dashed border-border p-10 text-center text-muted">
            New designs are on their way — check back soon!
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-4">
            {categories.map((c) => {
              const coverDoc = !c.coverImageUrl && c.coverCanvas ? parseDesignDoc(c.coverCanvas) : null;
              return (
                <Link
                  key={c.id}
                  href={c.slug === BOUQUET_CATEGORY_SLUG ? "/studio/bouquet" : `/studio/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-paper transition-all active:scale-[0.98] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-16px_rgba(30,42,74,0.25)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#ebe7df]">
                    {c.coverImageUrl ? (
                      <Image
                        src={c.coverImageUrl}
                        alt={c.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : coverDoc && "doc" in coverDoc ? (
                      <CategoryCover doc={coverDoc.doc} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gold-dark">
                        <Palette className="h-10 w-10" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3 sm:gap-3 sm:p-5">
                    <div>
                      <h2 className="font-display text-base leading-tight text-navy sm:text-xl">{c.name}</h2>
                      <p className="mt-0.5 text-xs text-muted sm:text-sm">
                        {c.slug === BOUQUET_CATEGORY_SLUG
                          ? "Build your own · pick every flower"
                          : `${c.templateCount} design${c.templateCount === 1 ? "" : "s"} · from ₹${c.startingPrice.toFixed(0)}`}
                      </p>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 shrink-0 text-gold-dark transition-transform group-hover:translate-x-1 sm:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
