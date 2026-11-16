import { SITE, absoluteUrl, categoryPath, productPath, truncate } from "@/lib/seo/site";

/**
 * schema.org structured-data builders. Output is plain JSON-LD objects; render
 * them with <JsonLd /> (components/seo/JsonLd.tsx). Only facts that are visible
 * on the page / true for the business go in here — no fabricated ratings.
 */

type Json = Record<string, unknown>;

const ORG_ID = () => `${absoluteUrl("/")}#organization`;
const SITE_ID = () => `${absoluteUrl("/")}#website`;

export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": ORG_ID(),
    name: SITE.name,
    legalName: SITE.legalName,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.logoPath),
    },
    image: absoluteUrl(SITE.logoFullPath),
    description: SITE.description,
    slogan: "Handcrafted gifts, made from the heart.",
    email: SITE.email,
    areaServed: { "@type": "Country", name: "India" },
    currenciesAccepted: SITE.currency,
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Wallets, Cash on Delivery",
    knowsAbout: [
      "Handmade gifts",
      "Personalized gifts",
      "Custom scrapbooks",
      "Explosion boxes",
      "Crochet bouquets",
      "Gift hampers",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    ...(SITE.sameAs.length > 0 ? { sameAs: SITE.sameAs } : {}),
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID(),
    url: absoluteUrl("/"),
    name: SITE.name,
    description: SITE.shortDescription,
    inLanguage: "en-IN",
    publisher: { "@id": ORG_ID() },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export interface ProductLike {
  id: string;
  name: string;
  sku: string;
  description: string;
  finalPrice: number;
  price: number;
  discountPercent: number;
  deliveryTime: string;
  isCustomizable: boolean;
  inStock: boolean;
  categoryName: string;
  images: string[];
  updatedAt?: Date;
}

export interface ProductReviewSummary {
  count: number;
  average: number;
  reviews: { author: string; rating: number; title: string | null; body: string; createdAt: Date }[];
}

export function productJsonLd(product: ProductLike, reviewSummary?: ProductReviewSummary): Json {
  const url = absoluteUrl(productPath(product));
  const { deliveryCharge, freeAbove, minDays, maxDays } = SITE.shipping;
  const shippingCost = product.finalPrice >= freeAbove ? 0 : deliveryCharge;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: truncate(product.description, 5000),
    sku: product.sku,
    mpn: product.sku,
    url,
    image: product.images.map(absoluteUrl),
    category: product.categoryName,
    brand: { "@type": "Brand", name: SITE.name },
    manufacturer: { "@id": ORG_ID() },
    material: "Handmade",
    ...(product.isCustomizable
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Customizable",
            value: "Yes — personalized to your photos, colours and message",
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: SITE.currency,
      price: product.finalPrice.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": ORG_ID() },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: shippingCost,
          currency: SITE.currency,
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: SITE.country },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: minDays,
            maxValue: maxDays,
            unitCode: "DAY",
          },
        },
      },
    },
    ...(reviewSummary && reviewSummary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(reviewSummary.average.toFixed(2)),
            reviewCount: reviewSummary.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviewSummary.reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.createdAt.toISOString().slice(0, 10),
            ...(r.title ? { name: r.title } : {}),
            reviewBody: r.body,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          })),
        }
      : {}),
  };
}

export function collectionJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  products: { id: string; name: string; image?: string | null }[];
}): Json {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": SITE_ID() },
    about: { "@id": ORG_ID() },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.products.length,
      itemListElement: opts.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(productPath(p)),
        name: p.name,
        ...(p.image ? { image: absoluteUrl(p.image) } : {}),
      })),
    },
  };
}

export { categoryPath };
