import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { generateVerificationToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import { registrationEmail } from "@/lib/email/templates";
import { jsonError, zodError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`register:${getClientIp(request)}`);
  if (!rate.allowed) {
    return jsonError("Too many requests. Please try again shortly.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return jsonError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateVerificationToken();

  const user = await prisma.user.create({
    data: { name, email, passwordHash, verificationToken },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    toName: user.name,
    subject: "Verify your email — Petal & Papers",
    html: registrationEmail({ name: user.name, verifyUrl }),
  });

  return NextResponse.json(
    {
      message: "Account created. Please check your email to verify your account.",
      user: { id: user.id, name: user.name, email: user.email },
    },
    { status: 201 },
  );
}
