import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistedProductIds } from "@/lib/wishlist";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const session = await getCurrentUser();
  const [wishlistedIds, reviewData, relatedProducts] = await Promise.all([
    session ? getWishlistedProductIds(session.sub) : Promise.resolve(new Set<string>()),
    getProductReviews(product.id),
    getRelatedProducts(product),
  ]);
  const isWishlisted = wishlistedIds.has(product.id);

  const outOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";
  const hasDiscount = product.discountPercent > 0;

  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url, altText: img.altText }))}
          name={product.name}
        />

        <div>
          <p className="text-xs tracking-wide text-muted uppercase">{product.category.name}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl text-navy">{product.name}</h1>
            <WishlistButton productId={product.id} initialSaved={isWishlisted} className="border border-border" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            {product.isCustomizable && (
              <Badge variant="gold">
                <Sparkles className="h-3 w-3" />
                Customizable
              </Badge>
            )}
            {outOfStock && <Badge variant="neutral">Out of Stock</Badge>}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl text-navy">
              ₹{product.finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-muted line-through">₹{product.price.toFixed(2)}</span>
                <Badge variant="sage">{product.discountPercent}% off</Badge>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted">{product.description}</p>

          <div className="mt-6 flex items-center gap-2 text-sm text-navy">
            <Truck className="h-4 w-4 text-gold-dark" />
            Delivery in {product.deliveryTime}
          </div>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              disabled={outOfStock}
              isCustomizable={product.isCustomizable}
              customizeHref={
                product.customizationForm && product.customizationForm.fields.length > 0
                  ? `/product/${product.id}/customize`
                  : null
              }
            />
          </div>
        </div>
      </Container>

      {reviewData.count > 0 ? (
        <Container className="mt-16 border-t border-border pt-16">
          <ProductReviews
            reviews={reviewData.reviews}
            count={reviewData.count}
            average={reviewData.average}
            breakdown={reviewData.breakdown}
          />
        </Container>
      ) : null}

      {relatedProducts.length > 0 ? (
        <Container
          className={cn(
            "mt-16 pt-16",
            reviewData.count === 0 && "border-t border-border",
          )}
        >
          <RelatedProducts
            products={relatedProducts.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price.toFixed(2),
              finalPrice: p.finalPrice.toFixed(2),
              discountPercent: p.discountPercent,
              stock: p.stock,
              status: p.status,
              isCustomizable: p.isCustomizable,
              category: { name: p.category.name },
              images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
              isWishlisted: wishlistedIds.has(p.id),
            }))}
          />
        </Container>
      ) : null}
    </Section>
  );
}
