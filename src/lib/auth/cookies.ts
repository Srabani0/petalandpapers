import type { NextResponse } from "next/server";
import { REFRESH_TOKEN_TTL_MS } from "@/lib/auth/jwt";

export const ACCESS_COOKIE = "pp_access_token";
export const REFRESH_COOKIE = "pp_refresh_token";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookie,
    maxAge: ACCESS_TOKEN_TTL_MS / 1000,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
