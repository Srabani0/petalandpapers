import { z } from "zod";

export const founderStorySchema = z.object({
  photoUrl: z.string().trim().url().optional().or(z.literal("")),
  heading: z.string().trim().min(1, "Required").max(120),
  message: z.string().trim().min(1, "Required").max(1000),
  founderName: z.string().trim().min(1, "Required").max(80),
});
export type FounderStoryInput = z.infer<typeof founderStorySchema>;
