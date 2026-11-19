import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartItemCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { getActivePromotions } from "@/lib/promotions";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { SITE, siteUrl } from "@/lib/seo/site";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "shopping",
  formatDetection: { email: false, address: false, telephone: false },
  // NOTE: no site-wide `alternates.canonical` here — it would be inherited by
  // every page and point them all at the homepage. Each page sets its own.
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.defaultTitle,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.defaultTitle,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: SITE.verification.google,
    other: SITE.verification.bing ? { "msvalidate.01": SITE.verification.bing } : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the layout use the full screen on notched phones (safe areas are padded in CSS).
  viewportFit: "cover",
  themeColor: SITE.themeColor,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUser();
  const user = session ? { name: session.name, role: session.role } : null;
  const cartCount = session ? await getCartItemCount(session.sub) : 0;
  const wishlistCount = session ? await getWishlistCount(session.sub) : 0;
  const promotions = await getActivePromotions();

  return (
    <html
      lang="en-IN"
      className={`${playfair.variable} ${inter.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <SiteChrome user={user} cartCount={cartCount} wishlistCount={wishlistCount} promotions={promotions}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
