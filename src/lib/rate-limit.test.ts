import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("checkRateLimit", () => {
  it("allows up to the max, then blocks", () => {
    const key = "t:block";
    for (let i = 0; i < 3; i++) expect(checkRateLimit(key, { max: 3 }).allowed).toBe(true);
    const blocked = checkRateLimit(key, { max: 3 });
    expect(blocked.allowed).toBe(false);
    expect(blocked).toHaveProperty("retryAfterMs");
  });

  it("resets after the window elapses", () => {
    const key = "t:reset";
    checkRateLimit(key, { max: 1, windowMs: 1000 });
    expect(checkRateLimit(key, { max: 1, windowMs: 1000 }).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(checkRateLimit(key, { max: 1, windowMs: 1000 }).allowed).toBe(true);
  });

  it("keeps keys independent and defaults to 10/min", () => {
    for (let i = 0; i < 10; i++) expect(checkRateLimit("t:a").allowed).toBe(true);
    expect(checkRateLimit("t:a").allowed).toBe(false);
    expect(checkRateLimit("t:b").allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("takes the first x-forwarded-for hop", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });
  it("falls back to 'unknown'", () => {
    expect(getClientIp(new Request("http://x"))).toBe("unknown");
  });
});
