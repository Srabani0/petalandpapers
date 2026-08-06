import { z } from "zod";

export const customerNotesSchema = z.object({
  adminNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});
