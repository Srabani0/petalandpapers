import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError, zodError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { bouquetRecipeSchema } from "@/lib/studio/doc";
import { saveBouquet } from "@/lib/studio/server";

const body = z.object({ recipe: bouquetRecipeSchema, designId: z.string().uuid().optional() });

/** Creates (or updates) the customer's bouquet design from a Bouquet Builder recipe. */
export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Please sign in to build your bouquet.", 401);

  const rate = checkRateLimit(`studio-bouquet:${session.sub}`, { max: 40, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) return jsonError("Too many changes at once — please wait a moment.", 429);

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const result = await saveBouquet(session.sub, parsed.data.recipe, parsed.data.designId);
  if ("error" in result) return jsonError(result.error, result.status ?? 400);
  return NextResponse.json({ id: result.id }, { status: 201 });
}
