import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const customizationRequest = await prisma.customizationRequest.findUnique({
    where: { id },
    include: { product: { select: { id: true, name: true } } },
  });

  if (!customizationRequest) return jsonError("Not found.", 404);
  if (customizationRequest.customerId !== session.sub && session.role !== "ADMIN") {
    return jsonError("Not found.", 404);
  }

  return NextResponse.json({ customizationRequest });
}
