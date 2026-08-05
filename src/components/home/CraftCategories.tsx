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
  type LucideIcon,
} from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICON_BY_KEYWORD: [string, LucideIcon][] = [
  ["scrapbook", BookHeart],
  ["explosion", PackageOpen],
  ["bouquet", Flower2],
  ["keychain", KeyRound],
  ["frame", Frame],
  ["memory", Camera],
  ["couple", HeartHandshake],
  ["hamper", Gift],
];

function iconFor(name: string) {
  const match = ICON_BY_KEYWORD.find(([keyword]) => name.toLowerCase().includes(keyword));
  return match?.[1] ?? Gift;
}

interface CategoryTile {
  slug: string;
  name: string;
}

export function CraftCategories({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;

  return (
    <Section className="bg-paper">
      <Container>
        <SectionHeading
          eyebrow="What We Craft"
          title="Design Your Own, or Shop Ready-to-Gift"
          description="Every customizable piece starts with your story — pick a category and tell us what makes this gift yours."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(({ slug, name }) => {
            const Icon = iconFor(name);
            return (
              <Link
                key={slug}
                href={`/shop?category=${slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-cream px-4 py-8 text-center transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-16px_rgba(30,42,74,0.25)]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold-dark transition-colors group-hover:bg-gold group-hover:text-cream">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-display text-sm text-navy sm:text-base">{name}</span>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
