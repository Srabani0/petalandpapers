import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { addressSchema } from "@/lib/validations/address";
import { jsonError, zodError } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const addresses = await prisma.address.findMany({
    where: { userId: session.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const data = parsed.data;
  const existingCount = await prisma.address.count({ where: { userId: session.sub } });
  const makeDefault = data.isDefault || existingCount === 0;

  if (makeDefault) {
    await prisma.address.updateMany({
      where: { userId: session.sub },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.sub,
      label: data.label || null,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: makeDefault,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
