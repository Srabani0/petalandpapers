"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Heart, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/layout/AccountMenu";

type HeaderUser = { name: string; role: "CUSTOMER" | "ADMIN" } | null;

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?customizable=true", label: "Customize" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  user = null,
  cartCount = 0,
  wishlistCount = 0,
}: {
  user?: HeaderUser;
  cartCount?: number;
  wishlistCount?: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur supports-backdrop-blur:bg-cream/80">
      <div className="hidden bg-navy text-cream sm:block">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs tracking-wide sm:px-6 lg:px-8">
          Handcrafted gifts, made from the heart &middot; Free shipping on orders above &#8377;999
        </p>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
            priority
          />
          <span className="font-display text-xl text-navy sm:text-2xl">
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
          <IconButton href="/cart" label="Cart">
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
        <nav className="border-t border-border bg-cream px-4 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {[
              ...NAV_LINKS,
              { href: "/wishlist", label: "Wishlist" },
              ...(user && user.role === "CUSTOMER" ? [{ href: "/orders", label: "Your Orders" }] : []),
              user
                ? { href: user.role === "ADMIN" ? "/admin" : "/", label: `Hi, ${user.name.split(" ")[0]}` }
                : { href: "/login", label: "Account" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-navy hover:bg-cream-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
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
