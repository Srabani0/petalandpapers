"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Tags, Package, ClipboardList, Ticket, Star, Users, Boxes, LogOut, Image as ImageIcon, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero Section", icon: ImageIcon },
  { href: "/admin/founder-story", label: "Founder Story", icon: HeartHandshake },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/coupons", label: "Coupons & Offers", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-paper">
      <Link href="/" className="flex items-center gap-2.5 border-b border-border px-6 py-5">
        <Image
          src="/brand/logo-mark.png"
          alt="Petal & Papers"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="font-display text-lg text-navy">Petal &amp; Papers</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-navy text-cream" : "text-navy/80 hover:bg-cream-dark",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <p className="truncate px-2 text-xs text-muted">Signed in as</p>
        <p className="truncate px-2 text-sm font-medium text-navy">{adminName}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-navy/80 hover:bg-cream-dark"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
