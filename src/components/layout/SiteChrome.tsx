"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import type { Promotion } from "@/components/layout/PromoStrip";

type SiteUser = { name: string; role: "CUSTOMER" | "ADMIN" } | null;

/**
 * Customer-facing shell: header, footer and WhatsApp. Admin routes have their own shell, and the design editor runs
 * full-screen like an app, so both render bare.
 */
export function SiteChrome({
  user,
  cartCount,
  wishlistCount,
  promotions,
  children,
}: {
  user: SiteUser;
  cartCount: number;
  wishlistCount: number;
  promotions: Promotion[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isEditor = pathname?.startsWith("/studio/design/");

  if (isAdmin || isEditor) return <>{children}</>;

  return (
    <>
      <Header user={user} cartCount={cartCount} wishlistCount={wishlistCount} promotions={promotions} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
