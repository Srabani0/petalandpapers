import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { issueRefreshToken } from "@/lib/auth/refresh-tokens";
import { setAuthCookies } from "@/lib/auth/cookies";
import { jsonError, zodError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_LOGIN_ATTEMPTS = 5; // FR-AUTH-09
const LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const rate = checkRateLimit(`login:${getClientIp(request)}`);
  if (!rate.allowed) {
    return jsonError("Too many requests. Please try again shortly.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic message whether the email doesn't exist or the password is
  // wrong — don't leak which one it was.
  const invalidCredentials = () => jsonError("Invalid email or password.", 401);

  if (!user || !user.isActive) return invalidCredentials();

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    return jsonError(
      `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
      423,
    );
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    const attempts = user.loginAttempts + 1;
    const lockingOut = attempts >= MAX_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: lockingOut ? 0 : attempts,
        lockedUntil: lockingOut ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
    return invalidCredentials();
  }

  if (!user.isVerified) {
    return jsonError("Please verify your email before logging in.", 403);
  }

  if (user.loginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const refreshToken = await issueRefreshToken(user.id);

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  setAuthCookies(response, { accessToken, refreshToken });
  return response;
}
