import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

/** Private / transactional / duplicate-content areas nobody should crawl. */
const DISALLOW = [
  "/admin",
  "/api/",
  "/cart",
  "/checkout",
  "/orders",
  "/order-confirmation",
  "/profile",
  "/wishlist",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/product/*/customize",
  "/shop?*",
];

/**
 * Search + AI-assistant crawlers, named explicitly. A crawler that matches a
 * named group ignores the `*` group entirely, so each repeats the disallow
 * list. Being named here is a clear, auditable "yes, index and cite us" for
 * answer engines (ChatGPT search, Claude, Perplexity, Gemini, Apple, Copilot).
 */
const SEARCH_AND_AI_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "Applebot",
  "DuckDuckBot",
  // Training / grounding crawlers
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "DuckAssistBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "CCBot",
  "cohere-ai",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...SEARCH_AND_AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
