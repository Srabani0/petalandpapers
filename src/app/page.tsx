import { Hero } from "@/components/home/Hero";
import { CraftCategories } from "@/components/home/CraftCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CustomizationSteps } from "@/components/home/CustomizationSteps";
import { ValueStrip } from "@/components/home/ValueStrip";
import { CtaBand } from "@/components/home/CtaBand";
import { listCategories, listProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistedProductIds } from "@/lib/wishlist";

export default async function HomePage() {
  const [categories, featured, session] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ page: 1, pageSize: 8, sort: "newest", customizable: undefined }),
    getCurrentUser(),
  ]);
  const wishlisted = session ? await getWishlistedProductIds(session.sub) : new Set<string>();

  const featuredProducts = featured.items.map((product) => ({
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

  return (
    <>
      <Hero />
      <ValueStrip />
      <CraftCategories categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <FeaturedProducts products={featuredProducts} />
      <CustomizationSteps />
      <CtaBand />
    </>
  );
}
