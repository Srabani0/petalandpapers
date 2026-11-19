import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Truck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import {
  SITE,
  absoluteUrl,
  categoryPath,
  parseProductParam,
  productPath,
  safeDecode,
  truncate,
} from "@/lib/seo/site";

interface Props {
  params: Promise<{ id: string }>;
}

// generateMetadata and the page both need the product; React's cache() makes
// that a single DB round-trip per request.
const loadProduct = cache(async (param: string) => getProductById(parseProductParam(param)));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  const path = productPath(product);
  const description = truncate(
    `${product.description} ${product.isCustomizable ? "Personalize it your way. " : ""}Handmade in India, delivered in ${product.deliveryTime}.`,
  );
  const images = product.images.slice(0, 4).map((img) => ({
    url: img.url,
    alt: img.altText ?? product.name,
  }));
  const title = product.isCustomizable
    ? `${product.name} – Personalized ${product.category.name}`
    : `${product.name} – Handmade ${product.category.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      url: absoluteUrl(path),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
    other: {
      "product:price:amount": product.finalPrice.toFixed(2),
      "product:price:currency": SITE.currency,
      "product:availability":
        product.stock === 0 || product.status === "OUT_OF_STOCK" ? "out of stock" : "in stock",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) notFound();

  // One canonical URL per product: old /product/<uuid> links and links with a
  // stale name slug 308-redirect to the current keyword slug.
  const canonicalPath = productPath(product);
  if (`/product/${safeDecode(id)}` !== canonicalPath) permanentRedirect(canonicalPath);

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
      <JsonLd
        data={[
          productJsonLd(
            {
              id: product.id,
              name: product.name,
              sku: product.sku,
              description: product.description,
              finalPrice: Number(product.finalPrice),
              price: Number(product.price),
              discountPercent: product.discountPercent,
              deliveryTime: product.deliveryTime,
              isCustomizable: product.isCustomizable,
              inStock: !outOfStock,
              categoryName: product.category.name,
              images: product.images.map((img) => img.url),
            },
            {
              count: reviewData.count,
              average: reviewData.average,
              reviews: reviewData.reviews.map((r) => ({
                author: r.customer.name,
                rating: r.rating,
                title: r.title,
                body: r.body,
                createdAt: r.createdAt,
              })),
            },
          ),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.category.name, path: categoryPath(product.category.slug) },
            { name: product.name, path: canonicalPath },
          ]),
        ]}
      />
      <Container className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url, altText: img.altText }))}
          name={product.name}
        />

        <div>
          <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
            <Link href="/" className="hover:text-gold-dark">
              Home
            </Link>
            {" / "}
            <Link href="/shop" className="hover:text-gold-dark">
              Shop
            </Link>
            {" / "}
            <Link href={categoryPath(product.category.slug)} className="hover:text-gold-dark">
              {product.category.name}
            </Link>
          </nav>
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

          {/* Phones: buy bar pinned above the tab bar (price + button), like a shopping app. */}
          <div className="fixed inset-x-0 bottom-[var(--tabbar-h)] z-30 flex items-center gap-3 border-t border-border bg-paper/95 px-4 py-3 shadow-[0_-10px_24px_-18px_rgba(30,42,74,0.45)] backdrop-blur-md lg:static lg:mt-8 lg:block lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <div className="min-w-0 shrink-0 lg:hidden">
              <p className="font-display text-lg leading-tight text-navy">₹{product.finalPrice.toFixed(0)}</p>
              {hasDiscount ? <p className="text-xs text-muted line-through">₹{product.price.toFixed(0)}</p> : null}
            </div>
            <div className="min-w-0 flex-1 [&_a]:w-full [&_button]:w-full lg:[&_a]:w-auto lg:[&_button]:w-auto">
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
          <div aria-hidden className="h-20 lg:hidden" />
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
