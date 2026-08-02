import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <ComingSoon
      icon={ShoppingBag}
      title="Your Cart Is Coming Soon"
      description="Cart, checkout and coupons are built together with the product catalog in an upcoming phase."
    />
  );
}
