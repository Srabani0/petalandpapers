import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.sub) return jsonError("Address not found.", 404);

  await prisma.address.updateMany({ where: { userId: session.sub }, data: { isDefault: false } });
  const address = await prisma.address.update({ where: { id }, data: { isDefault: true } });

  return NextResponse.json({ address });
}
