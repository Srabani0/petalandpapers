import { prisma } from "@/lib/prisma";
import { SITE, absoluteUrl, categoryPath, productPath } from "@/lib/seo/site";
import { HOME_FAQS } from "@/lib/seo/faq";
import {
  DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD,
  RUSH_ORDER_FEE,
  GIFT_WRAP_FEE,
} from "@/lib/cart-constants";

/**
 * Builds /llms.txt (concise index) and /llms-full.txt (everything) — the
 * emerging convention for giving LLM-based assistants a clean, markdown view of
 * a site: who we are, what we sell, real prices, policies. Generated from the
 * live catalogue, so it never goes stale.
 */

const money = (n: number) => `₹${Number(n).toFixed(0)}`;
const oneLine = (s: string, max = 220) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

async function loadCatalogue() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { categories, products };
}

function header() {
  return [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "## About",
    `${SITE.name} is an independent Indian online store for handmade and personalized gifts. Everything is crafted by hand and made to order — many products can be customized with the buyer's own photos, names, colours and message, and a design preview is shared for approval before production on approval-based items.`,
    "",
    "## Key facts",
    `- Website: ${absoluteUrl("/")}`,
    "- Location served: all of India (ships nationwide)",
    `- Currency: ${SITE.currency} (₹)`,
    `- Delivery: ₹${DELIVERY_CHARGE} per order, free above ₹${FREE_DELIVERY_THRESHOLD}; typically ${SITE.shipping.minDays}–${SITE.shipping.maxDays} business days (shown per product)`,
    `- Optional extras at checkout: rush processing (+₹${RUSH_ORDER_FEE}), gift wrap (+₹${GIFT_WRAP_FEE}), gift message, scheduled delivery date`,
    "- Payment: UPI, cards, net banking, wallets (via Razorpay) and Cash on Delivery",
    "- Returns: made-to-order items can be cancelled free before production starts; damaged or incorrect items are replaced or refunded if reported within 48 hours of delivery",
    `- Contact: ${SITE.email}`,
    "",
  ];
}

function policies() {
  return [
    "## Policies & help",
    `- [Shipping policy](${absoluteUrl("/shipping-policy")})`,
    `- [Refund & cancellation policy](${absoluteUrl("/refund-policy")})`,
    `- [Privacy policy](${absoluteUrl("/privacy-policy")})`,
    `- [Terms & conditions](${absoluteUrl("/terms-conditions")})`,
    `- [Our story](${absoluteUrl("/about")})`,
    `- [Contact](${absoluteUrl("/contact")})`,
    "",
  ];
}

function faq() {
  return [
    "## Frequently asked questions",
    ...HOME_FAQS.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
  ];
}

export async function buildLlmsTxt() {
  const { categories, products } = await loadCatalogue();
  const lines = [
    ...header(),
    "## Shop by category",
    ...categories.map((c) => {
      const count = products.filter((p) => p.category.slug === c.slug).length;
      return `- [${c.name}](${absoluteUrl(categoryPath(c.slug))})${c.description ? `: ${oneLine(c.description, 140)}` : ""} (${count} products)`;
    }),
    "",
    "## Featured products",
    ...products.slice(0, 24).map(
      (p) =>
        `- [${p.name}](${absoluteUrl(productPath(p))}): ${money(Number(p.finalPrice))}${p.isCustomizable ? ", customizable" : ""} — ${oneLine(p.description, 120)}`,
    ),
    "",
    ...policies(),
    `Full catalogue with descriptions and prices: ${absoluteUrl("/llms-full.txt")}`,
    "",
  ];
  return lines.join("\n");
}

export async function buildLlmsFullTxt() {
  const { categories, products } = await loadCatalogue();
  const lines = [...header(), "## Full catalogue", ""];

  for (const category of categories) {
    const inCategory = products.filter((p) => p.category.slug === category.slug);
    if (inCategory.length === 0) continue;
    lines.push(`### ${category.name}`, `Page: ${absoluteUrl(categoryPath(category.slug))}`);
    if (category.description) lines.push(oneLine(category.description, 400));
    lines.push("");
    for (const p of inCategory) {
      const price = Number(p.finalPrice);
      const mrp = Number(p.price);
      const inStock = p.stock > 0 && p.status !== "OUT_OF_STOCK";
      lines.push(
        `#### ${p.name}`,
        `- URL: ${absoluteUrl(productPath(p))}`,
        `- Price: ${money(price)}${p.discountPercent > 0 ? ` (${p.discountPercent}% off ${money(mrp)})` : ""}`,
        `- SKU: ${p.sku}`,
        `- Customizable: ${p.isCustomizable ? "yes" : "no"}`,
        `- Delivery time: ${p.deliveryTime}`,
        `- Availability: ${inStock ? "in stock" : "out of stock"}`,
        "",
        oneLine(p.description, 600),
        "",
      );
    }
  }

  lines.push(...policies(), ...faq());
  return lines.join("\n");
}
