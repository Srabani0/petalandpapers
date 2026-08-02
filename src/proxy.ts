import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

// NOTE: Next.js 16 renamed `middleware.ts` -> `proxy.ts` (nodejs runtime only,
// no edge). RBAC enforcement for admin routes (NFR-SEC-07: unauthorized
// access returns 403).
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/admin");
  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  function deny() {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!token) return deny();

  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== "ADMIN") return deny();
  } catch {
    return deny();
  }

  return NextResponse.next();
}
