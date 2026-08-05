import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "New Coupon" };

export default async function NewCouponPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">New Coupon</h1>
      <div className="mt-6">
        <CouponForm categories={categories} />
      </div>
    </div>
  );
}
