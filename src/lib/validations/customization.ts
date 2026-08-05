import { z } from "zod";

export const CUSTOMIZATION_FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "DROPDOWN",
  "COLOR",
  "NUMBER",
  "IMAGE_UPLOAD",
  "FILE_UPLOAD",
  "CHECKBOX",
  "DATE",
] as const;

export const customizationFieldSchema = z.object({
  id: z.string().optional(), // present when editing an existing field, absent for new ones
  label: z.string().trim().min(1, "Label is required").max(100),
  fieldType: z.enum(CUSTOMIZATION_FIELD_TYPES),
  placeholder: z.string().trim().max(150).optional().or(z.literal("")),
  isRequired: z.boolean().optional().default(true),
  options: z.array(z.string().trim().min(1)).optional().default([]),
  minValue: z.string().trim().optional().or(z.literal("")),
  maxValue: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.number().int().optional().default(0),
});
export type CustomizationFieldInput = z.infer<typeof customizationFieldSchema>;

export const customizationFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  fields: z.array(customizationFieldSchema).min(1, "Add at least one field"),
});
export type CustomizationFormInput = z.infer<typeof customizationFormSchema>;
