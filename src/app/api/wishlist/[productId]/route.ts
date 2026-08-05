import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { removeFromWishlist } from "@/lib/wishlist";
import { jsonError } from "@/lib/api-response";

interface Params {
  params: Promise<{ productId: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const { productId } = await params;
  await removeFromWishlist(session.sub, productId);
  return NextResponse.json({ ok: true });
}
