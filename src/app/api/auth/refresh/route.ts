import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { rotateRefreshToken } from "@/lib/auth/refresh-tokens";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { jsonError } from "@/lib/api-response";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const rawToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${REFRESH_COOKIE}=`))
    ?.slice(REFRESH_COOKIE.length + 1);

  if (!rawToken) return jsonError("Not authenticated.", 401);

  let userId: string;
  try {
    const payload = await verifyRefreshToken(rawToken);
    userId = payload.sub;
  } catch {
    const response = jsonError("Session expired. Please log in again.", 401);
    clearAuthCookies(response);
    return response;
  }

  const newRefreshToken = await rotateRefreshToken(userId, rawToken);
  if (!newRefreshToken) {
    const response = jsonError("Session expired. Please log in again.", 401);
    clearAuthCookies(response);
    return response;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    const response = jsonError("Account unavailable.", 401);
    clearAuthCookies(response);
    return response;
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, { accessToken, refreshToken: newRefreshToken });
  return response;
}
