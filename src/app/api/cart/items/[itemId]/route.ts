import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { updateCartItemSchema } from "@/lib/validations/cart";
import { updateCartItemQuantity, removeCartItem, getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ itemId: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { itemId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await updateCartItemQuantity(session.sub, itemId, parsed.data.quantity);
  if ("error" in result) return jsonError(result.error, 400);

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);
  return NextResponse.json({ cart, totals });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { itemId } = await params;

  const result = await removeCartItem(session.sub, itemId);
  if ("error" in result) return jsonError(result.error, 400);

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);
  return NextResponse.json({ cart, totals });
}
