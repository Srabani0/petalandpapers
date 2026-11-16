// Simple in-memory fixed-window rate limiter for auth endpoints (NFR-SEC-11:
// max 10 requests/minute/IP). In-memory means limits are per server instance
// — fine for single-instance dev/small deploys; move to Redis/Upstash if the
// app scales to multiple instances.

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  { max = MAX_REQUESTS, windowMs = WINDOW_MS }: { max?: number; windowMs?: number } = {},
) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
