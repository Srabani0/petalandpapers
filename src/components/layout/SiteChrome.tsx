"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type SiteUser = { name: string; role: "CUSTOMER" | "ADMIN" } | null;

/** Hides the customer-facing header/footer on /admin routes, which have their own shell. */
export function SiteChrome({
  user,
  cartCount,
  wishlistCount,
  children,
}: {
  user: SiteUser;
  cartCount: number;
  wishlistCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header user={user} cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
