"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Heart, ShoppingBag, Package, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { PromoStrip, type Promotion } from "@/components/layout/PromoStrip";
import { SessionKeepAlive } from "@/components/auth/SessionKeepAlive";

type HeaderUser = { name: string; role: "CUSTOMER" | "ADMIN" } | null;

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/studio", label: "Customize" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  user = null,
  cartCount = 0,
  wishlistCount = 0,
  promotions = [],
}: {
  user?: HeaderUser;
  cartCount?: number;
  wishlistCount?: number;
  promotions?: Promotion[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-blur:bg-cream/80">
      {user ? <SessionKeepAlive /> : null}
      <div className="hidden bg-navy text-cream sm:block">
        <PromoStrip promotions={promotions} />
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="h-9 w-9 rounded-full object-cover lg:h-11 lg:w-11"
            priority
          />
          <span className="font-display text-lg text-navy sm:text-xl lg:text-2xl">
            Petal &amp; Papers
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-navy/80 transition-colors hover:text-gold-dark",
                pathname === link.href && "text-gold-dark",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <IconButton href="/shop" label="Search">
            <Search className="h-5 w-5" />
          </IconButton>
          <IconButton href="/wishlist" label="Wishlist" className="hidden sm:inline-flex">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-cream">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            ) : null}
          </IconButton>
          {user && user.role === "CUSTOMER" ? (
            <IconButton href="/orders" label="Your Orders" className="hidden sm:inline-flex">
              <Package className="h-5 w-5" />
            </IconButton>
          ) : null}
          <AccountMenu user={user} />
          <IconButton href="/cart" label="Cart" className="hidden lg:inline-flex">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-cream">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </IconButton>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-cream-dark lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="pp-rise max-h-[calc(100dvh-3.5rem-var(--tabbar-h))] overflow-y-auto border-t border-border bg-cream px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {[
              ...NAV_LINKS,
              { href: "/wishlist", label: "Wishlist" },
              ...(user && user.role === "CUSTOMER" ? [{ href: "/orders", label: "Your Orders" }] : []),
              user
                ? {
                    href: user.role === "ADMIN" ? "/admin" : "/profile",
                    label: `Hi, ${user.name.split(" ")[0]}`,
                  }
                : { href: "/login", label: "Account" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-[15px] font-medium text-navy hover:bg-cream-dark active:bg-cream-dark",
                    pathname === link.href && "bg-cream-dark",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-error hover:bg-error/10 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function IconButton({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-md text-navy transition-colors hover:bg-cream-dark hover:text-gold-dark",
        className,
      )}
    >
      {children}
    </Link>
  );
}
