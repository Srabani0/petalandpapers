const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  /** Where a plain "Reply" should go (e.g. the customer who filled in a contact form). */
  replyTo?: { email: string; name?: string };
}

/**
 * Sends a transactional email via Brevo. Never throws — a missing/invalid
 * API key or a Brevo outage should not break registration, checkout, etc.
 * (NFR-REL-05). Failures are logged; in development, the email is also
 * logged in full so auth flows are testable without a real Brevo account.
 */
export async function sendEmail({ to, toName, subject, html, replyTo }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "srabaninahak664@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Petal & Papers";

  if (process.env.NODE_ENV === "development") {
    console.log(`\n[email] → ${to} :: ${subject}\n${html}\n`);
  }

  if (!apiKey) {
    console.warn(`[email] BREVO_API_KEY not set — skipped sending "${subject}" to ${to}`);
    return { sent: false as const, reason: "missing-api-key" as const };
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, name: toName }],
        ...(replyTo ? { replyTo } : {}),
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Brevo send failed (${res.status}): ${body}`);
      return { sent: false as const, reason: "api-error" as const };
    }

    return { sent: true as const };
  } catch (error) {
    console.error("[email] Brevo request threw:", error);
    return { sent: false as const, reason: "network-error" as const };
  }
}
