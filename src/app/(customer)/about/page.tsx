import type { Metadata } from "next";
import Image from "next/image";
import { HandHeart, Leaf, Sparkles } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Our Story – Handmade Gifts Made With Love",
  description:
    "The story behind Petal & Papers: an Indian studio crafting handmade, personalized scrapbooks, bouquets, explosion boxes and gifts, made to order and built around your memories.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: HandHeart,
    title: "Made by Hand",
    description:
      "Every scrapbook, bouquet and box is put together by hand — not pulled off an assembly line.",
  },
  {
    icon: Sparkles,
    title: "Personal by Design",
    description:
      "We build each customizable product around your details — your photos, your colours, your words.",
  },
  {
    icon: Leaf,
    title: "Made to Order",
    description:
      "We craft pieces as they're ordered rather than mass-producing ahead of time, so nothing feels generic.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pb-0">
        <Container className="flex flex-col items-center gap-6 text-center">
          <Image
            src="/brand/logo-mark.png"
            alt="Petal & Papers"
            width={72}
            height={72}
            className="h-18 w-18 rounded-full object-cover"
          />
          <h1 className="max-w-2xl font-display text-4xl text-navy sm:text-5xl">
            Handcrafted gifts, made from the heart.
          </h1>
          <p className="max-w-xl text-muted">
            Petal &amp; Papers started with a simple belief: a gift means more when
            it&apos;s made for one specific person, not for everyone. Every piece we
            create — from a scrapbook to a bouquet that never wilts — is built around
            the story you want to tell.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="What We Believe" title="Where Memories Bloom Beautifully" />
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-paper p-8 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg text-navy">{title}</h3>
                <p className="text-sm text-muted">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
