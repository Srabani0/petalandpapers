import { z } from "zod";

export const CONTACT_TOPICS = [
  "Custom order",
  "Bulk / corporate gifting",
  "Order help",
  "Product question",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+()\-\s]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  topic: z.enum(CONTACT_TOPICS),
  orderNumber: z.string().trim().max(30).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a few words so we can help")
    .max(2000, "Message must be at most 2000 characters"),
  // Honeypot: real users never see or fill this; bots do.
  website: z.string().max(200).optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;
