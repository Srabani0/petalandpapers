import { z } from "zod";

export const heroContentSchema = z.object({
  eyebrowText: z.string().trim().min(1, "Required").max(120),
  headingLine: z.string().trim().min(1, "Required").max(80),
  headingScript: z.string().trim().min(1, "Required").max(60),
  description: z.string().trim().min(1, "Required").max(400),
  primaryCtaLabel: z.string().trim().min(1, "Required").max(40),
  primaryCtaHref: z.string().trim().min(1, "Required").max(200),
  secondaryCtaLabel: z.string().trim().min(1, "Required").max(40),
  secondaryCtaHref: z.string().trim().min(1, "Required").max(200),
});
export type HeroContentInput = z.infer<typeof heroContentSchema>;
