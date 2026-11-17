import { z } from "zod";
import { STUDIO_KINDS } from "@/lib/studio/doc";

const cloudinaryUrl = z
  .string()
  .trim()
  .regex(/^https:\/\/res\.cloudinary\.com\//, "Upload the image through the uploader")
  .max(600);

/** /studio/<slug> sits next to these fixed routes, so a category can't take their names. */
export const RESERVED_STUDIO_SLUGS = ["design", "my-designs"];

export const studioCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
    .max(80)
    .refine((s) => !RESERVED_STUDIO_SLUGS.includes(s), "That URL is reserved — choose another slug")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  coverImageUrl: cloudinaryUrl.optional().or(z.literal("")),
  kind: z.enum(STUDIO_KINDS),
  productId: z.string().trim().min(1, "Choose the product this category is ordered as"),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});
export type StudioCategoryInput = z.infer<typeof studioCategorySchema>;

export const studioTemplateMetaSchema = z.object({
  categoryId: z.string().trim().min(1),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  sizeLabel: z.string().trim().min(1, "Enter a size label, e.g. 6 × 8 in").max(60),
  width: z.coerce.number().int().min(200).max(6000),
  height: z.coerce.number().int().min(200).max(6000),
  price: z.coerce.number().positive("Price must be greater than 0").max(1_000_000),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});
export type StudioTemplateMeta = z.infer<typeof studioTemplateMetaSchema>;

export const createDesignSchema = z.union([
  z.object({ templateId: z.string().min(1) }),
  z.object({ fromDesignId: z.string().min(1) }),
]);

export const addDesignToCartSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20).optional().default(1),
});
