import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { applyCouponSchema } from "@/lib/validations/cart";
import { applyCouponToCart, removeCouponFromCart, getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = applyCouponSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await applyCouponToCart(session.sub, parsed.data.code);
  if ("error" in result) return jsonError(result.error, 400);

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);
  return NextResponse.json({ cart, totals });
}

export async function DELETE(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  await removeCouponFromCart(session.sub);

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);
  return NextResponse.json({ cart, totals });
}
