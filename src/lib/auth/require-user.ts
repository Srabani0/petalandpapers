import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/**
 * Auth check for customer-facing route handlers that aren't under
 * `/api/admin/*` (so `proxy.ts` doesn't gate them) — this is the primary
 * enforcement, not just defense-in-depth. Returns the token payload for any
 * signed-in user (customer or admin), or null.
 */
export async function requireUser(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ACCESS_COOKIE}=`))
    ?.slice(ACCESS_COOKIE.length + 1);

  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
