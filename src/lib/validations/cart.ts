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
});
