import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { generateOTP, OTP_TTL_MS } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import { passwordResetEmail } from "@/lib/email/templates";
import { zodError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a password reset code.";

export async function POST(request: Request) {
  const rate = checkRateLimit(`forgot-password:${getClientIp(request)}`);
  if (!rate.allowed) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always return the same response — don't reveal whether the email exists.
  if (user) {
    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOTP: otp, resetOTPExpiry: new Date(Date.now() + OTP_TTL_MS) },
    });
    await sendEmail({
      to: user.email,
      toName: user.name,
      subject: "Your password reset code — Petal & Papers",
      html: passwordResetEmail({ name: user.name, otp }),
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
