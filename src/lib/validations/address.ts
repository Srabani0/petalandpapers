import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().or(z.literal("")),
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  addressLine1: z.string().trim().min(3, "Address is required").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  isDefault: z.boolean().optional().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const addressUpdateSchema = addressSchema.partial();
