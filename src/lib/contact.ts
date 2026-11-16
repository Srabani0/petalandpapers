import { sendEmail } from "@/lib/email/brevo";
import { contactMessageEmail } from "@/lib/email/templates";
import { SITE } from "@/lib/seo/site";
import type { ContactInput } from "@/lib/validations/contact";

/**
 * Delivers a contact-form message to the business inbox with the customer set
 * as Reply-To. Honeypot hits are acknowledged but silently dropped, so bots
 * learn nothing. If email delivery fails in production the caller gets an error
 * — never a fake "sent" — so the customer knows to use the direct email/WhatsApp.
 */
export async function submitContactMessage(
  input: ContactInput,
): Promise<{ error: string } | { ok: true }> {
  if (input.website) return { ok: true as const };

  const result = await sendEmail({
    to: SITE.email,
    toName: SITE.name,
    replyTo: { email: input.email, name: input.name },
    subject: `[Contact] ${input.topic} — ${input.name}`,
    html: contactMessageEmail({
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      topic: input.topic,
      orderNumber: input.orderNumber || undefined,
      message: input.message,
    }),
  });

  // Without a Brevo key (local dev) sendEmail logs the full email instead;
  // treat that as success so the form is testable. Anywhere else, surface it.
  if (!result.sent && !(process.env.NODE_ENV === "development" && result.reason === "missing-api-key")) {
    return {
      error: `We couldn't send your message right now. Please email us directly at ${SITE.email}.`,
    };
  }

  return { ok: true as const };
}
