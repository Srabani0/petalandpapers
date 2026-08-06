import { z } from "zod";

export const reviewSchema = z.object({
  orderId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1, "Pick a star rating").max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewModerationSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN"]),
  adminNote: z.string().trim().max(500).optional().or(z.literal("")),
});
