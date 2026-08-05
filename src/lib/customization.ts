// Pure validation logic for dynamic customization forms — no server-only
// imports, so both the API route handler and the client-side form can use
// the exact same rules for required/min/max checks.

export interface CustomizationFieldLike {
  id: string;
  label: string;
  fieldType:
    | "TEXT"
    | "TEXTAREA"
    | "DROPDOWN"
    | "COLOR"
    | "NUMBER"
    | "IMAGE_UPLOAD"
    | "FILE_UPLOAD"
    | "CHECKBOX"
    | "DATE";
  isRequired: boolean;
  options: string[] | null;
  minValue: string | null;
  maxValue: string | null;
  placeholder?: string | null;
}

export type CustomizationFormData = Record<string, string | number | boolean | null | undefined>;

export function validateCustomizationFormData(
  fields: CustomizationFieldLike[],
  formData: CustomizationFormData,
) {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = formData[field.id];
    const isEmpty = value === undefined || value === null || value === "";

    if (field.isRequired && isEmpty && field.fieldType !== "CHECKBOX") {
      errors[field.id] = `${field.label} is required.`;
      continue;
    }
    if (isEmpty) continue;

    switch (field.fieldType) {
      case "TEXT":
      case "TEXTAREA": {
        const str = String(value);
        const min = field.minValue ? Number(field.minValue) : undefined;
        const max = field.maxValue ? Number(field.maxValue) : undefined;
        if (min !== undefined && str.length < min) {
          errors[field.id] = `${field.label} must be at least ${min} characters.`;
        } else if (max !== undefined && str.length > max) {
          errors[field.id] = `${field.label} must be at most ${max} characters.`;
        }
        break;
      }
      case "NUMBER": {
        const num = Number(value);
        const min = field.minValue ? Number(field.minValue) : undefined;
        const max = field.maxValue ? Number(field.maxValue) : undefined;
        if (Number.isNaN(num)) {
          errors[field.id] = `${field.label} must be a number.`;
        } else if (min !== undefined && num < min) {
          errors[field.id] = `${field.label} must be at least ${min}.`;
        } else if (max !== undefined && num > max) {
          errors[field.id] = `${field.label} must be at most ${max}.`;
        }
        break;
      }
      case "DROPDOWN": {
        if (field.options && field.options.length > 0 && !field.options.includes(String(value))) {
          errors[field.id] = `Choose a valid option for ${field.label}.`;
        }
        break;
      }
      default:
        break;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
