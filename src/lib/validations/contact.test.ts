import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validations/contact";

const valid = {
  name: "Asha Rao",
  email: "Asha@Example.com ",
  topic: "Custom order",
  message: "I'd love a personalized scrapbook for our anniversary.",
};

describe("contactSchema", () => {
  it("accepts a valid message and normalises the email", () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("asha@example.com");
  });

  it("rejects an unknown topic", () => {
    expect(contactSchema.safeParse({ ...valid, topic: "Spam" }).success).toBe(false);
  });

  it("rejects too-short names and messages", () => {
    expect(contactSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  it("rejects over-long messages", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });

  it("rejects a bad email and a phone containing letters", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, phone: "+91 98765-43210" }).success).toBe(true);
  });
});
