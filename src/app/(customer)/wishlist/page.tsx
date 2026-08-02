import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <ComingSoon
      icon={Heart}
      title="Wishlist Coming Soon"
      description="Save your favourite pieces here once the product catalog goes live."
    />
  );
}
