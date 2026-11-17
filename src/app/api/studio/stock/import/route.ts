import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { importStock, stockEnabled } from "@/lib/studio/stock";

const body = z.object({ id: z.number().int().positive() });

/** Copies a chosen stock image into our Cloudinary so designs never hot-link Pixabay. */
export async function POST(request: Request) {
  if (!stockEnabled()) return jsonError("Stock images are not set up.", 503);

  const session = await requireUser(request);
  if (!session) return jsonError("Please sign in to use images.", 401);

  const rate = checkRateLimit(`studio-stock-import:${session.sub}`, { max: 40, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) return jsonError("You're adding images very quickly — please wait a few minutes.", 429);

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid image.", 400);

  try {
    const result = await importStock(parsed.data.id);
    if (!result) return jsonError("That image is no longer available.", 404);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] stock import failed:", error);
    return jsonError("Couldn't add that image. Please try another.", 500);
  }
}
