import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { addressUpdateSchema } from "@/lib/validations/address";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.sub) return jsonError("Address not found.", 404);

  const body = await request.json().catch(() => null);
  const parsed = addressUpdateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.sub },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      ...(data.label !== undefined ? { label: data.label || null } : {}),
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.addressLine1 !== undefined ? { addressLine1: data.addressLine1 } : {}),
      ...(data.addressLine2 !== undefined ? { addressLine2: data.addressLine2 || null } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.pincode !== undefined ? { pincode: data.pincode } : {}),
      ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
    },
  });

  return NextResponse.json({ address });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.sub) return jsonError("Address not found.", 404);

  await prisma.address.delete({ where: { id } });

  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.sub },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return NextResponse.json({ ok: true });
}
