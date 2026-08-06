import { prisma } from "@/lib/prisma";

const heroInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
};

export type HeroContentWithImages = NonNullable<Awaited<ReturnType<typeof getHeroContent>>>;

export const MAX_HERO_IMAGES = 4;

/** Singleton row, auto-created on first access so the admin panel and homepage always have one to read/edit. */
export async function getHeroContent() {
  const existing = await prisma.heroContent.findFirst({ include: heroInclude });
  if (existing) return existing;
  return prisma.heroContent.create({ data: {}, include: heroInclude });
}

export async function updateHeroContent(input: {
  eyebrowText: string;
  headingLine: string;
  headingScript: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}) {
  const content = await getHeroContent();
  return prisma.heroContent.update({
    where: { id: content.id },
    data: input,
    include: heroInclude,
  });
}
