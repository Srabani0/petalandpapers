import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { STOCK_KINDS, searchStock, stockEnabled, type StockKind } from "@/lib/studio/stock";

/** Searches free stock images (Pixabay) for the Design Studio. Signed-in users only. */
export async function GET(request: Request) {
  if (!stockEnabled()) return NextResponse.json({ enabled: false, items: [], total: 0 });
  const params = new URL(request.url).searchParams;
  if (params.has("probe")) return NextResponse.json({ enabled: true });

  const session = await requireUser(request);
  if (!session) return jsonError("Please sign in to search images.", 401);

  const rate = checkRateLimit(`studio-stock:${session.sub}`, { max: 60, windowMs: 60 * 1000 });
  if (!rate.allowed) return jsonError("Searching too quickly — please wait a moment.", 429);

  const query = (params.get("q") ?? "").trim();
  const kind = (STOCK_KINDS as readonly string[]).includes(params.get("kind") ?? "") ? (params.get("kind") as StockKind) : "cutout";
  const page = Math.min(10, Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1));

  try {
    const result = await searchStock(query, kind, page);
    return NextResponse.json({ enabled: true, ...result });
  } catch (error) {
    console.error("[studio] stock search failed:", error);
    return jsonError("Image search is unavailable right now.", 502);
  }
}
