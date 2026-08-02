import Link from "next/link";
import {
  BookHeart,
  PackageOpen,
  Flower2,
  KeyRound,
  Frame,
  Camera,
  HeartHandshake,
  Gift,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CUSTOM_CATEGORIES = [
  { label: "Scrapbooks", icon: BookHeart },
  { label: "Explosion Boxes", icon: PackageOpen },
  { label: "Personalized Bouquets", icon: Flower2 },
  { label: "Personalized Keychains", icon: KeyRound },
  { label: "Customized Frames", icon: Frame },
  { label: "Memory Gifts", icon: Camera },
  { label: "Couple Gifts", icon: HeartHandshake },
  { label: "Personalized Hampers", icon: Gift },
];

const READY_MADE = [
  "Ready-made Keychains",
  "Pipe Cleaner Bouquets",
  "Artificial Flower Bouquets",
  "Greeting Cards",
  "Gift Hampers",
  "Decorative Items",
];

export function CraftCategories() {
  return (
    <Section className="bg-paper">
      <Container>
        <SectionHeading
          eyebrow="What We Craft"
          title="Design Your Own, or Shop Ready-to-Gift"
          description="Every customizable piece starts with your story — pick a category and tell us what makes this gift yours."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CUSTOM_CATEGORIES.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              href="/shop?customizable=true"
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-cream px-4 py-8 text-center transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-16px_rgba(30,42,74,0.25)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold-dark transition-colors group-hover:bg-gold group-hover:text-cream">
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-display text-sm text-navy sm:text-base">{label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
          <p className="text-sm font-medium text-muted">Also ready to ship, no wait required</p>
          <div className="flex flex-wrap justify-center gap-2">
            {READY_MADE.map((item) => (
              <Link
                key={item}
                href="/shop"
                className="rounded-full border border-border bg-cream px-4 py-2 text-xs font-medium text-navy transition-colors hover:border-sage hover:bg-sage/10"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
