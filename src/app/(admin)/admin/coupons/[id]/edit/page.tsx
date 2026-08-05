import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Edit Coupon" };

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coupon, categories] = await Promise.all([
    prisma.coupon.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!coupon) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Edit Coupon</h1>
      <div className="mt-6">
        <CouponForm
          categories={categories}
          initial={{
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            minOrderValue: Number(coupon.minOrderValue),
            maxDiscountAmount: coupon.maxDiscountAmount !== null ? Number(coupon.maxDiscountAmount) : null,
            usageLimit: coupon.usageLimit,
            perUserLimit: coupon.perUserLimit,
            expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0, 10) : "",
            isActive: coupon.isActive,
            applicableCategories: coupon.applicableCategories,
          }}
        />
      </div>
    </div>
  );
}
