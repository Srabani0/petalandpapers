import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { revokeAllRefreshTokens } from "@/lib/auth/refresh-tokens";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { email, otp, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.resetOTP ||
    !user.resetOTPExpiry ||
    user.resetOTP !== otp ||
    user.resetOTPExpiry < new Date()
  ) {
    return jsonError("That code is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetOTP: null,
      resetOTPExpiry: null,
      loginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Force re-login on every device after a password reset.
  await revokeAllRefreshTokens(user.id);

  return NextResponse.json({ message: "Password reset. You can now log in." });
}
