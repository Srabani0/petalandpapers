import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { customerNotesSchema } from "@/lib/validations/customer";
import { updateCustomerNotes } from "@/lib/customers";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = customerNotesSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const result = await updateCustomerNotes(id, parsed.data.adminNotes ?? "");
  if ("error" in result) return jsonError(result.error, 404);

  return NextResponse.json({ ok: true });
}
