import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/**
 * Defense-in-depth check for admin route handlers. `proxy.ts` already blocks
 * non-admins from reaching `/api/admin/*`, but route handlers re-verify here
 * too (and this is how they get the admin's id/email for audit fields).
 */
export async function requireAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ACCESS_COOKIE}=`))
    ?.slice(ACCESS_COOKIE.length + 1);

  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    return payload.role === "ADMIN" ? payload : null;
  } catch {
    return null;
  }
}
