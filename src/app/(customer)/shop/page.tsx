import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <ComingSoon
      icon={ShoppingBag}
      title="The Full Catalog Is On Its Way"
      description="We're busy building the shop — product listing, filters, search and the customization builder land in the next phase of the build."
    />
  );
}
