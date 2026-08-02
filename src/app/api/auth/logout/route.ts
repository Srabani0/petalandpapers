import { NextResponse } from "next/server";
import { revokeRefreshToken } from "@/lib/auth/refresh-tokens";
import { clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const rawToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${REFRESH_COOKIE}=`))
    ?.slice(REFRESH_COOKIE.length + 1);

  if (rawToken) {
    await revokeRefreshToken(rawToken);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
