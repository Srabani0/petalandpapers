import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { submitContactMessage } from "@/lib/contact";
import { jsonError, zodError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Public endpoint that triggers an outbound email — keep it tight (5 / 10 min / IP).
  const rate = checkRateLimit(`contact:${getClientIp(request)}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) {
    return jsonError("Too many messages. Please try again in a few minutes.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await submitContactMessage(parsed.data);
  if ("error" in result) return jsonError(result.error, 502);

  return NextResponse.json({ ok: true });
}
