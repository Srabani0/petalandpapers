import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Palette, MousePointerClick, ImagePlus, ShoppingBag } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listStudioCategories } from "@/lib/studio/server";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Design Your Own Gift – Customize 3D Miniatures, Mugs & Frames",
  description:
    "Design your own personalized gift online: pick a template, add your photos, names and stickers with our drag-and-drop studio, and we'll handcraft it for you. Delivered across India.",
  alternates: { canonical: "/studio" },
};

// Catalogue changes when the admin publishes templates — keep it fresh.
export const dynamic = "force-dynamic";

const STEPS = [
  { icon: Palette, title: "Pick a template", text: "Choose a ready-made layout in the size you want." },
  { icon: ImagePlus, title: "Make it yours", text: "Drop in photos, edit text, add stickers — drag, resize, rotate." },
  { icon: MousePointerClick, title: "Preview & save", text: "See exactly how it will look before you order." },
  { icon: ShoppingBag, title: "We handcraft it", text: "Add to cart and we'll make and ship it to you." },
];

export default async function StudioPage() {
  const [categories, session] = await Promise.all([listStudioCategories(), getCurrentUser()]);

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Design Studio"
          title="Design Your Own Gift"
          description="Start from one of our templates, then make every detail yours — your photos, your words, your colours."
        />

        <ol className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex flex-col gap-2 rounded-xl border border-border bg-paper p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                <Icon className="h-4 w-4" />
              </span>
              <p className="font-display text-navy">
                <span className="mr-1 text-gold-dark">{i + 1}.</span>
                {title}
              </p>
              <p className="text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>

        {categories.length === 0 ? (
          <p className="mx-auto mt-14 max-w-md rounded-xl border border-dashed border-border p-10 text-center text-muted">
            New designs are on their way — check back soon!
          </p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/studio/${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-paper transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-16px_rgba(30,42,74,0.25)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
                  {c.coverImageUrl ? (
                    <Image
                      src={c.coverImageUrl}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gold-dark">
                      <Palette className="h-10 w-10" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <h2 className="font-display text-xl text-navy">{c.name}</h2>
                  {c.description ? <p className="line-clamp-2 text-sm text-muted">{c.description}</p> : null}
                  <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                    <span className="text-muted">
                      {c.templateCount} template{c.templateCount === 1 ? "" : "s"} · from{" "}
                      <span className="font-medium text-navy">₹{c.startingPrice.toFixed(0)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-gold-dark">
                      Start <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {session ? (
          <p className="mt-10 text-center text-sm text-muted">
            Continue where you left off in{" "}
            <Link href="/studio/my-designs" className="text-gold-dark underline underline-offset-4">
              My Designs
            </Link>
            .
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
