import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { reviewCustomizationSchema } from "@/lib/validations/order";
import { jsonError, zodError } from "@/lib/api-response";

/** Customer approves a design preview, or sends it back for changes. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = reviewCustomizationSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.customizationRequest.findUnique({ where: { id } });
  if (!existing || existing.customerId !== session.sub) {
    return jsonError("Customization request not found.", 404);
  }
  if (existing.status !== "AWAITING_APPROVAL") {
    return jsonError("This design isn't awaiting your approval right now.", 400);
  }

  const customizationRequest = await prisma.customizationRequest.update({
    where: { id },
    data:
      parsed.data.decision === "APPROVE"
        ? { status: "APPROVED", approvedAt: new Date() }
        : {
            status: "CHANGES_REQUESTED",
            customerNotes: parsed.data.notes
              ? `${existing.customerNotes ? `${existing.customerNotes}\n\n` : ""}Revision request: ${parsed.data.notes}`
              : existing.customerNotes,
          },
  });

  return NextResponse.json({ customizationRequest });
}
