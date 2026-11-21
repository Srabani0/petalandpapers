import { getAppUrl } from "@/lib/app-url";

/**
 * Single source of truth for everything search engines and AI assistants
 * read about the business. Keep facts here in sync with the policy pages
 * (shipping, refund) — structured data that contradicts visible page content
 * is treated as spam by Google.
 */
export const SITE = {
  name: "Petal & Papers",
  legalName: "Petal & Papers",
  tagline: "Handmade & Personalized Gifts",
  defaultTitle: "Handmade & Personalized Gifts Online in India | Petal & Papers",
  description:
    "Buy handmade, customized gifts online in India — personalized scrapbooks, explosion boxes, crochet bouquets, keychains, photo frames and gift hampers, crafted to order by hand and delivered across India.",
  shortDescription:
    "Handmade, customizable gifts — scrapbooks, explosion boxes, crochet bouquets, keychains, frames and hampers — crafted to order in India.",
  email: process.env.CONTACT_RECEIVER_EMAIL || "srabaninahak664@gmail.com",
  // Same number as the WhatsApp chat button.
  phone: "+91 84880 82783",
  whatsapp: "918488082783",
  instagram: "petalandpapers",
  locale: "en_IN",
  country: "IN",
  currency: "INR",
  logoPath: "/brand/logo-mark.png",
  logoFullPath: "/brand/logo-full.png",
  themeColor: "#1e2a4a",
  keywords: [
    "handmade gifts",
    "personalized gifts online India",
    "customized gifts",
    "handmade gifts online",
    "gift for her",
    "gift for him",
    "birthday gift ideas",
    "anniversary gifts",
    "personalized scrapbook",
    "explosion box",
    "crochet bouquet",
    "handmade bouquet",
    "custom keychain",
    "photo frame gift",
    "gift hampers",
    "Petal & Papers",
  ],
  // Pricing/shipping facts mirrored from /shipping-policy and /refund-policy.
  shipping: {
    deliveryCharge: 99,
    freeAbove: 999,
    minDays: 3,
    maxDays: 10,
  },
  returns: {
    // Made-to-order items: no change-of-mind returns once production starts.
    damagedClaimHours: 48,
  },
  // Optional — set in env to enable the matching verification meta tags.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    bing: process.env.BING_SITE_VERIFICATION,
  },
  // Social profiles — fed into Organization `sameAs` and the footer icons.
  // Instagram is built in; add more (comma-separated) via SOCIAL_PROFILE_URLS.
  sameAs: [
    ...new Set([
      "https://www.instagram.com/petalandpapers/",
      ...(process.env.SOCIAL_PROFILE_URLS ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ]),
  ],
} as const;

export function siteUrl() {
  return getAppUrl();
}

/** Absolute URL for a site-relative path. Passes absolute URLs through. */
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

const UUID_TAIL = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/**
 * SEO-friendly product path: `/product/personalized-scrapbook-<uuid>`.
 * The keyword slug is purely cosmetic — the trailing UUID is what's looked up,
 * so renaming a product never breaks an old link (it 308-redirects to the
 * current canonical path instead).
 */
export function productPath(product: { id: string; name: string }) {
  const slug = slugifyName(product.name);
  return slug ? `/product/${slug}-${product.id}` : `/product/${product.id}`;
}

export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Extracts the product id from either `<uuid>` or `<slug>-<uuid>`. */
export function parseProductParam(param: string) {
  const decoded = safeDecode(param);
  const match = decoded.match(UUID_TAIL);
  return match ? match[1].toLowerCase() : decoded;
}

export function categoryPath(slug: string) {
  return `/category/${slug}`;
}

/** Trims text to a meta-description-friendly length on a word boundary. */
export function truncate(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:\s]+$/, "")}…`;
}
