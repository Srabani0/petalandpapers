import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { jsonError } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);

  return NextResponse.json({ cart, totals });
}
