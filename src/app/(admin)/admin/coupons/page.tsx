import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/Button";
import { CouponTable } from "@/components/admin/CouponTable";

export const metadata: Metadata = { title: "Coupons & Offers" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  const rows = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value.toFixed(2),
    minOrderValue: coupon.minOrderValue.toFixed(2),
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
    isActive: coupon.isActive,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy">Coupons & Offers</h1>
          <p className="mt-1 text-sm text-muted">Create and manage discount codes for your store.</p>
        </div>
        <Link href="/admin/coupons/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" />
          New Coupon
        </Link>
      </div>

      <div className="mt-6">
        <CouponTable coupons={rows} />
      </div>
    </div>
  );
}
