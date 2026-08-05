import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { couponSchema } from "@/lib/validations/coupon";
import { jsonError, zodError } from "@/lib/api-response";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const body = await request.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { code, expiresAt, minOrderValue, perUserLimit, ...rest } = parsed.data;

  const codeTaken = await prisma.coupon.findUnique({ where: { code } });
  if (codeTaken) return jsonError("A coupon with this code already exists.", 409);

  const coupon = await prisma.coupon.create({
    data: {
      ...rest,
      code,
      minOrderValue: minOrderValue ?? 0,
      perUserLimit: perUserLimit ?? 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: rest.isActive ?? true,
      applicableCategories: rest.applicableCategories ?? [],
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
