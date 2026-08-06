import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { stockAdjustmentSchema } from "@/lib/validations/inventory";
import { adjustStock } from "@/lib/inventory";
import { jsonError, zodError } from "@/lib/api-response";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return jsonError("Unauthorized", 403);

  const body = await request.json().catch(() => null);
  const parsed = stockAdjustmentSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await adjustStock(
    parsed.data.productId,
    admin.sub,
    parsed.data.quantityChange,
    parsed.data.reason,
  );
  if ("error" in result) return jsonError(result.error, 400);

  return NextResponse.json({ ok: true }, { status: 201 });
}
