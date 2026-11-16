import { beforeEach, describe, expect, it, vi } from "vitest";

const sendEmail = vi.fn();
vi.mock("@/lib/email/brevo", () => ({ sendEmail: (...args: unknown[]) => sendEmail(...args) }));

import { submitContactMessage } from "@/lib/contact";
import { contactMessageEmail, escapeHtml } from "@/lib/email/templates";

const input = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "",
  topic: "Custom order" as const,
  orderNumber: "",
  message: "I'd love a personalized scrapbook.",
  website: "",
};

beforeEach(() => sendEmail.mockReset());

describe("submitContactMessage", () => {
  it("emails the business inbox with the customer as Reply-To", async () => {
    sendEmail.mockResolvedValue({ sent: true });
    const result = await submitContactMessage(input);

    expect(result).toEqual({ ok: true });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const call = sendEmail.mock.calls[0][0];
    expect(call.to).toBe("owner@petalandpapers.test");
    expect(call.replyTo).toEqual({ email: "asha@example.com", name: "Asha Rao" });
    expect(call.subject).toContain("Custom order");
  });

  it("silently drops honeypot submissions without sending anything", async () => {
    const result = await submitContactMessage({ ...input, website: "http://spam.example" });
    expect(result).toEqual({ ok: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reports failure (never a fake success) when delivery fails", async () => {
    sendEmail.mockResolvedValue({ sent: false, reason: "api-error" });
    const result = await submitContactMessage(input);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain("owner@petalandpapers.test");
  });
});

describe("contact email HTML", () => {
  it("escapes HTML in every user-supplied field", () => {
    const html = contactMessageEmail({
      name: '<img src=x onerror="alert(1)">',
      email: "a@b.co",
      topic: "<b>Topic</b>",
      message: "<script>steal()</script>",
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>Topic</b>");
    expect(html).toContain("&lt;script&gt;steal()&lt;/script&gt;");
  });

  it("escapeHtml handles quotes and ampersands", () => {
    expect(escapeHtml(`Tom & "Jerry's"`)).toBe("Tom &amp; &quot;Jerry&#39;s&quot;");
  });
});
