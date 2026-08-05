import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { couponUpdateSchema } from "@/lib/validations/coupon";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = couponUpdateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) return jsonError("Coupon not found.", 404);

  const { code, expiresAt, ...rest } = parsed.data;

  if (code && code !== existing.code) {
    const codeTaken = await prisma.coupon.findUnique({ where: { code } });
    if (codeTaken) return jsonError("A coupon with this code already exists.", 409);
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(code ? { code } : {}),
      ...rest,
      ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
    },
  });

  return NextResponse.json({ coupon });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const [cartUses, orderUses] = await Promise.all([
    prisma.cart.count({ where: { couponId: id } }),
    prisma.order.count({ where: { couponId: id } }),
  ]);
  if (orderUses > 0) {
    return jsonError(`Can't delete — ${orderUses} order(s) used this coupon. Deactivate it instead.`, 409);
  }
  if (cartUses > 0) {
    await prisma.cart.updateMany({ where: { couponId: id }, data: { couponId: null } });
  }

  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
