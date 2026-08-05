import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, Sparkles } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { getProductById } from "@/lib/products";
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
  const isWishlisted = session ? (await getWishlistedProductIds(session.sub)).has(product.id) : false;

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
    </Section>
  );
}
