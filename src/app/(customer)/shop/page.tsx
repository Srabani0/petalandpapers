import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { listProducts, listCategories } from "@/lib/products";
import { productListQuerySchema } from "@/lib/validations/product";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { absoluteUrl } from "@/lib/seo/site";

type ShopSearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * /shop is the one indexable "all products" listing. Every filtered/sorted/
 * searched/paginated variant is a near-duplicate of it (or of a /category page),
 * so those are noindex + canonicalized — otherwise Google spreads ranking
 * across thousands of parameter URLs.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasVariant = Object.keys(params).length > 0;
  const category = typeof params.category === "string" ? params.category : undefined;

  const title = "Shop Handmade & Personalized Gifts";
  const description =
    "Browse all handmade and customizable gifts from Petal & Papers — scrapbooks, explosion boxes, crochet bouquets, keychains, photo frames and gift hampers, delivered across India.";

  return {
    title,
    description,
    alternates: { canonical: category ? `/category/${category}` : "/shop" },
    ...(hasVariant ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: absoluteUrl("/shop"), type: "website" },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const singleValued = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const parsed = productListQuerySchema.safeParse(singleValued);
  const query = parsed.success ? parsed.data : productListQuerySchema.parse({});

  const [result, categories, session] = await Promise.all([
    listProducts(query),
    listCategories({ activeOnly: true }),
    getCurrentUser(),
  ]);
  const wishlisted = session ? await getWishlistedProductIds(session.sub) : new Set<string>();

  const products = result.items.map((product) => ({
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
    isWishlisted: wishlisted.has(product.id),
  }));

  const buildHref = (page: number) => {
    const params = new URLSearchParams(
      Object.entries(singleValued).filter(([, v]) => v !== undefined) as [string, string][],
    );
    params.set("page", String(page));
    return `/shop?${params.toString()}`;
  };

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Shop"
          title="Every Piece, Made With Care"
          description="Browse ready-to-ship favourites or find your next customizable gift."
        />

        <div className="mt-10 flex flex-col gap-6">
          <Suspense fallback={null}>
            <ShopFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
          </Suspense>

          <ProductGrid products={products} />

          <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
        </div>
      </Container>
    </Section>
  );
}
