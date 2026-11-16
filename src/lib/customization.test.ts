import { describe, expect, it } from "vitest";
import { validateCustomizationFormData, type CustomizationFieldLike } from "@/lib/customization";

const field = (over: Partial<CustomizationFieldLike> & Pick<CustomizationFieldLike, "id" | "fieldType">): CustomizationFieldLike => ({
  label: over.id,
  isRequired: false,
  options: null,
  minValue: null,
  maxValue: null,
  ...over,
});

describe("validateCustomizationFormData", () => {
  it("requires required fields but lets optional ones be empty", () => {
    const fields = [field({ id: "a", fieldType: "TEXT", isRequired: true }), field({ id: "b", fieldType: "TEXT" })];
    const r = validateCustomizationFormData(fields, { a: "", b: "" });
    expect(r.valid).toBe(false);
    expect(Object.keys(r.errors)).toEqual(["a"]);
  });

  it("a required CHECKBOX may be unchecked (it is not a consent gate)", () => {
    const r = validateCustomizationFormData([field({ id: "c", fieldType: "CHECKBOX", isRequired: true })], { c: false });
    expect(r.valid).toBe(true);
  });

  it("enforces min/max length on text", () => {
    const f = [field({ id: "t", fieldType: "TEXT", minValue: "3", maxValue: "5" })];
    expect(validateCustomizationFormData(f, { t: "ab" }).valid).toBe(false);
    expect(validateCustomizationFormData(f, { t: "abcd" }).valid).toBe(true);
    expect(validateCustomizationFormData(f, { t: "abcdef" }).valid).toBe(false);
  });

  it("enforces numeric range and rejects non-numbers", () => {
    const f = [field({ id: "n", fieldType: "NUMBER", minValue: "1", maxValue: "10" })];
    expect(validateCustomizationFormData(f, { n: 0 }).valid).toBe(false);
    expect(validateCustomizationFormData(f, { n: 11 }).valid).toBe(false);
    expect(validateCustomizationFormData(f, { n: "x" }).valid).toBe(false);
    expect(validateCustomizationFormData(f, { n: 5 }).valid).toBe(true);
  });

  it("only accepts configured dropdown options", () => {
    const f = [field({ id: "d", fieldType: "DROPDOWN", options: ["Red", "Blue"] })];
    expect(validateCustomizationFormData(f, { d: "Green" }).valid).toBe(false);
    expect(validateCustomizationFormData(f, { d: "Blue" }).valid).toBe(true);
  });

  it("treats 0 as a real value, not empty", () => {
    const f = [field({ id: "n", fieldType: "NUMBER", isRequired: true })];
    expect(validateCustomizationFormData(f, { n: 0 }).valid).toBe(true);
  });
});
