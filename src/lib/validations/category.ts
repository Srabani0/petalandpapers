import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  skuPrefix: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Prefix must be at least 2 characters")
    .max(10, "Prefix must be at most 10 characters")
    .regex(/^[A-Z0-9]+$/, "Prefix can only contain letters and numbers"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const categoryUpdateSchema = categorySchema.partial();
