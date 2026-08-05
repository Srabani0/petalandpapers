import { z } from "zod";

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "CUSTOMIZATION_RECEIVED",
  "DESIGNING",
  "WAITING_APPROVAL",
  "APPROVED",
  "PRODUCTION",
  "READY",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  trackingNumber: z.string().trim().max(100).optional(),
  courierName: z.string().trim().max(100).optional(),
  adminNotes: z.string().trim().max(2000).optional(),
});

export const reviewCustomizationSchema = z.object({
  decision: z.enum(["APPROVE", "REQUEST_CHANGES"]),
  notes: z.string().trim().max(2000).optional(),
});

export const updateCustomizationStatusSchema = z.object({
  status: z.enum(["PENDING", "RECEIVED", "IN_DESIGN", "REJECTED"]),
  adminNotes: z.string().trim().max(2000).optional(),
});
