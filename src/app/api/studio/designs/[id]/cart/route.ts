import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError, zodError } from "@/lib/api-response";
import { addDesignToCartSchema } from "@/lib/validations/studio";
import { addDesignToCart } from "@/lib/studio/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const session = await requireUser(request);
  if (!session) return jsonError("Please sign in to add to cart.", 401);
  const { id } = await params;

  const parsed = addDesignToCartSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return zodError(parsed.error);

  const result = await addDesignToCart(session.sub, id, parsed.data.quantity);
  if ("error" in result) return jsonError(result.error, 400);
  return NextResponse.json({ ok: true });
}
