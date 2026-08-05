import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { addWishlistItemSchema } from "@/lib/validations/wishlist";
import { addToWishlist } from "@/lib/wishlist";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = addWishlistItemSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await addToWishlist(session.sub, parsed.data.productId);
  if ("error" in result) return jsonError(result.error, 400);

  return NextResponse.json({ ok: true }, { status: 201 });
}
