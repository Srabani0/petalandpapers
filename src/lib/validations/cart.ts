import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(50).optional().default(1),
  customizationRequestId: z.string().trim().min(1).optional(),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(50),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code").toUpperCase(),
});

export const checkoutSchema = z.object({
  addressId: z.string().trim().min(1, "Select a delivery address"),
  paymentMethod: z.enum(["ONLINE", "COD"]).optional().default("ONLINE"),
  giftMessage: z.string().trim().max(300, "Keep the gift message under 300 characters").optional(),
  scheduledDeliveryDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => {
      if (!value) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(value) >= today;
    }, "Delivery date can't be in the past"),
  isRushOrder: z.boolean().optional().default(false),
  giftWrap: z.boolean().optional().default(false),
});
