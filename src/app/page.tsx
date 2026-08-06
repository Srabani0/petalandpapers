import { Hero } from "@/components/home/Hero";
import { CraftCategories } from "@/components/home/CraftCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CustomizationSteps } from "@/components/home/CustomizationSteps";
import { ValueStrip } from "@/components/home/ValueStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { FounderStory } from "@/components/home/FounderStory";
import { CtaBand } from "@/components/home/CtaBand";
import { listCategories, listProducts, getHeroShowcaseImages } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { listFeaturedReviews } from "@/lib/reviews";
import { getHeroContent } from "@/lib/hero";
import { getFounderStory } from "@/lib/founder-story";

export default async function HomePage() {
  const [categories, featured, session, featuredReviews, heroContent, autoShowcaseImages, founderStory] =
    await Promise.all([
      listCategories({ activeOnly: true }),
      listProducts({ page: 1, pageSize: 8, sort: "newest", customizable: undefined }),
      getCurrentUser(),
      listFeaturedReviews(6),
      getHeroContent(),
      getHeroShowcaseImages(4),
      getFounderStory(),
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

  const testimonials = featuredReviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    customerName: review.customer.name,
    productName: review.product.name,
  }));

  const showcaseImages =
    heroContent.images.length > 0
      ? heroContent.images.map((img) => ({ url: img.url, alt: img.altText ?? "Handmade bouquet" }))
      : autoShowcaseImages.map((img) => ({ url: img.url, alt: img.altText ?? img.product.name }));

  return (
    <>
      <Hero
        eyebrowText={heroContent.eyebrowText}
        headingLine={heroContent.headingLine}
        headingScript={heroContent.headingScript}
        description={heroContent.description}
        primaryCtaLabel={heroContent.primaryCtaLabel}
        primaryCtaHref={heroContent.primaryCtaHref}
        secondaryCtaLabel={heroContent.secondaryCtaLabel}
        secondaryCtaHref={heroContent.secondaryCtaHref}
        showcaseImages={showcaseImages}
      />
      <ValueStrip />
      <CraftCategories
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, imageUrl: c.imageUrl }))}
      />
      <FeaturedProducts products={featuredProducts} />
      <CustomizationSteps />
      <CtaBand />
      <FounderStory
        photoUrl={founderStory.photoUrl}
        heading={founderStory.heading}
        message={founderStory.message}
        founderName={founderStory.founderName}
      />
      <Testimonials reviews={testimonials} />
    </>
  );
}
