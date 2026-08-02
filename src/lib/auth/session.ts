import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

/**
 * Reads and verifies the access token cookie for use in Server Components,
 * Server Actions, and Route Handlers. Returns null if missing/expired/invalid
 * — callers decide whether that means "redirect to login" or "render as guest".
 */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
