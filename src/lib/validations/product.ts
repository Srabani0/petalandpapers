import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().trim().min(1, "Choose a category"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPercent: z.coerce.number().int().min(0).max(100).optional().default(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional().default(5),
  deliveryTime: z.string().trim().min(2, "e.g. '5-7 business days'"),
  isCustomizable: z.boolean().optional().default(false),
  requiresApproval: z.boolean().optional().default(false),
  minPhotos: z.coerce.number().int().min(0).optional().nullable(),
  maxPhotos: z.coerce.number().int().min(0).optional().nullable(),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
});
export type ProductInput = z.infer<typeof productSchema>;

export const productUpdateSchema = productSchema.partial();

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(48).optional().default(12),
  category: z.string().trim().optional(),
  q: z.string().trim().optional(),
  customizable: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional().default("newest"),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
