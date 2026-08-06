import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  productId: z.string().trim().min(1),
  quantityChange: z.coerce.number().int().refine((n) => n !== 0, "Enter a non-zero quantity"),
  reason: z.string().trim().min(3, "Add a short reason").max(300),
});
