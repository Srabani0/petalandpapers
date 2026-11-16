import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistItems } from "@/lib/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/wishlist");

  const items = await getWishlistItems(session.sub);

  const products = items.map(({ product }) => ({
    id: product.id,
    name: product.name,
    price: product.price.toFixed(2),
    finalPrice: product.finalPrice.toFixed(2),
    discountPercent: product.discountPercent,
    stock: product.stock,
    status: product.status,
    isCustomizable: product.isCustomizable,
    category: { name: product.category.name },
    images: product.images.map((img) => ({ url: img.url, altText: img.altText })),
    isWishlisted: true,
  }));

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Saved"
          title="Your Wishlist"
          description="Pieces you've saved for later — tap the heart again to remove one."
        />

        <div className="mt-10">
          {products.length === 0 ? (
            <ComingSoon
              icon={Heart}
              title="Nothing Saved Yet"
              description="Tap the heart on any product to save it here for later."
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </Container>
    </Section>
  );
}
