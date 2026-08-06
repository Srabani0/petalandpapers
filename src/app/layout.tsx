import type { Metadata } from "next";
import { Playfair_Display, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartItemCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { getActivePromotions } from "@/lib/promotions";

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
  title: {
    default: "Petal & Papers | Handcrafted & Personalized Gifts",
    template: "%s | Petal & Papers",
  },
  description:
    "Handcrafted gifts, made from the heart. Shop scrapbooks, explosion boxes, personalized bouquets, keychains, frames and more — customized just for the people you love.",
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
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <SiteChrome user={user} cartCount={cartCount} wishlistCount={wishlistCount} promotions={promotions}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
