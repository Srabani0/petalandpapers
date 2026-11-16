import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/Container";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategoryBySlug, listCategories, listProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo/jsonld";
import { SITE, absoluteUrl, categoryPath, truncate } from "@/lib/seo/site";

const PAGE_SIZE = 24;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const loadCategory = cache(async (slug: string) => {
  const category = await getCategoryBySlug(slug);
  return category && category.isActive ? category : null;
});

function introFor(name: string, description: string | null) {
  if (description && description.trim().length >= 40) return description.trim();
  return `Explore our handmade ${name.toLowerCase()} — each piece is crafted by hand in India, made to order, and available to personalize with your own photos, colours and message. A thoughtful gift for birthdays, anniversaries, weddings and every moment worth remembering.`;
}

function parsePage(raw: string | undefined) {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const category = await loadCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };

  const page = parsePage(rawPage);
  const path = page > 1 ? `${categoryPath(slug)}?page=${page}` : categoryPath(slug);
  const title = `Handmade ${category.name} – Personalized Gifts Online${page > 1 ? ` (Page ${page})` : ""}`;
  const description = truncate(
    `Shop handmade ${category.name.toLowerCase()} online in India. ${introFor(category.name, category.description)}`,
  );

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
      ...(category.imageUrl ? { images: [{ url: category.imageUrl, alt: category.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(category.imageUrl ? { images: [category.imageUrl] } : {}),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const category = await loadCategory(slug);
  if (!category) notFound();

  const page = parsePage(rawPage);
  const [result, allCategories, session] = await Promise.all([
    listProducts({ page, pageSize: PAGE_SIZE, category: slug, sort: "newest", customizable: undefined }),
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

  const path = categoryPath(slug);
  const intro = introFor(category.name, category.description);
  const otherCategories = allCategories.filter((c) => c.slug !== slug);

  return (
    <Section>
      <JsonLd
        data={[
          collectionJsonLd({
            name: `Handmade ${category.name}`,
            description: intro,
            path,
            products: result.items.map((p) => ({
              id: p.id,
              name: p.name,
              image: p.images[0]?.url ?? null,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: category.name, path },
          ]),
        ]}
      />
      <Container>
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/" className="hover:text-gold-dark">
            Home
          </Link>
          {" / "}
          <Link href="/shop" className="hover:text-gold-dark">
            Shop
          </Link>
          {" / "}
          <span className="text-navy">{category.name}</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="font-display text-3xl text-navy sm:text-4xl">
            Handmade {category.name}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{intro}</p>
        </header>

        <div className="mt-10 flex flex-col gap-6">
          <ProductGrid products={products} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(p) => (p > 1 ? `${path}?page=${p}` : path)}
          />
        </div>

        {otherCategories.length > 0 ? (
          <nav aria-label="More categories" className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-xl text-navy">More handmade gift ideas</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={categoryPath(c.slug)}
                    className="inline-block rounded-full border border-border bg-paper px-4 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </Section>
  );
}
