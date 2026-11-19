"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Wand2, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TabUser = { name: string; role: "CUSTOMER" | "ADMIN" } | null;

/** App-style bottom navigation for phones and small tablets (hidden on desktop). */
export function MobileTabBar({ user, cartCount }: { user: TabUser; cartCount: number }) {
  const pathname = usePathname() ?? "/";
  const account = user ? (user.role === "ADMIN" ? "/admin" : "/profile") : "/login";

  const tabs = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/shop", label: "Shop", icon: Store, active: pathname.startsWith("/shop") || pathname.startsWith("/category") || pathname.startsWith("/product") },
    { href: "/studio", label: "Customize", icon: Wand2, active: pathname.startsWith("/studio"), primary: true },
    { href: "/cart", label: "Cart", icon: ShoppingBag, active: pathname.startsWith("/cart") || pathname.startsWith("/checkout"), badge: cartCount },
    {
      href: account,
      label: user ? "Account" : "Sign in",
      icon: User,
      active: ["/profile", "/orders", "/wishlist", "/login", "/register"].some((p) => pathname.startsWith(p)),
    },
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgba(30,42,74,0.35)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-1">
        {tabs.map(({ href, label, icon: Icon, active, primary, badge }) => (
          <li key={label} className="flex flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className="group flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
            >
              {primary ? (
                <span
                  className={cn(
                    "-mt-6 flex h-12 w-12 items-center justify-center rounded-full border-4 border-paper shadow-[0_8px_18px_-6px_rgba(166,124,61,0.7)] transition-transform group-active:scale-90",
                    active ? "bg-navy text-cream" : "bg-gold text-cream",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <span
                  className={cn(
                    "relative flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 group-active:scale-90",
                    active ? "bg-navy/8 text-navy" : "text-navy/55",
                  )}
                >
                  <Icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.4]")} />
                  {badge ? (
                    <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-cream">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
              )}
              <span className={cn("leading-none", active ? "text-navy" : "text-navy/55")}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
