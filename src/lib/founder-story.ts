import { prisma } from "@/lib/prisma";

/** Singleton row, auto-created on first access so the admin panel and homepage always have one to read/edit. */
export async function getFounderStory() {
  const existing = await prisma.founderStory.findFirst();
  if (existing) return existing;
  return prisma.founderStory.create({ data: {} });
}

export async function updateFounderStory(input: {
  photoUrl: string | null;
  heading: string;
  message: string;
  founderName: string;
}) {
  const story = await getFounderStory();
  return prisma.founderStory.update({ where: { id: story.id }, data: input });
}
