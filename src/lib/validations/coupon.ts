import { z } from "zod";

const couponBaseSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9]+$/, "Code can only contain letters and numbers"),
  type: z.enum(["PERCENTAGE", "FLAT_AMOUNT"]),
  value: z.coerce.number().positive("Value must be greater than 0"),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  applicableCategories: z.array(z.string()).optional(),
});

function checkPercentageCap(data: { type?: string; value?: number }, ctx: z.RefinementCtx) {
  if (data.type === "PERCENTAGE" && data.value !== undefined && data.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discounts can't exceed 100",
      path: ["value"],
    });
  }
}

export const couponSchema = couponBaseSchema.superRefine(checkPercentageCap);
export type CouponInput = z.infer<typeof couponSchema>;

export const couponUpdateSchema = couponBaseSchema.partial().superRefine(checkPercentageCap);
