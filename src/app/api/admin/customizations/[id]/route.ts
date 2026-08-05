import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateCustomizationStatusSchema } from "@/lib/validations/order";
import { jsonError, zodError } from "@/lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateCustomizationStatusSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.customizationRequest.findUnique({ where: { id } });
  if (!existing) return jsonError("Customization request not found.", 404);

  const customizationRequest = await prisma.customizationRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes ?? existing.adminNotes,
    },
  });

  return NextResponse.json({ customizationRequest });
}
