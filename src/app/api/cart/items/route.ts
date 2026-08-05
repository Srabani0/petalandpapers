import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { addCartItemSchema } from "@/lib/validations/cart";
import { addItemToCart, getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = addCartItemSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await addItemToCart(
    session.sub,
    parsed.data.productId,
    parsed.data.quantity,
    parsed.data.customizationRequestId,
  );
  if ("error" in result) return jsonError(result.error, 400);

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);
  return NextResponse.json({ cart, totals }, { status: 201 });
}
