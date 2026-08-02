import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { sendEmail } from "@/lib/email/brevo";
import { emailVerifiedEmail } from "@/lib/email/templates";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const user = await prisma.user.findFirst({
    where: { verificationToken: parsed.data.token },
  });

  if (!user) {
    return jsonError("This verification link is invalid or has already been used.", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null },
  });

  await sendEmail({
    to: user.email,
    toName: user.name,
    subject: "You're verified! — Petal & Papers",
    html: emailVerifiedEmail({ name: user.name }),
  });

  return NextResponse.json({ message: "Email verified. You can now log in." });
}
