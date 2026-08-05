import type { Metadata } from "next";
import Link from "next/link";
import { Tags, Package, ArchiveX, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const [categoryCount, productCount, archivedCount, outOfStockCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
    prisma.product.count({ where: { stock: 0, status: { not: "ARCHIVED" } } }),
  ]);

  const cards = [
    { label: "Categories", value: categoryCount, icon: Tags, href: "/admin/categories" },
    { label: "Active Products", value: productCount, icon: Package, href: "/admin/products" },
    { label: "Out of Stock", value: outOfStockCount, icon: TrendingUp, href: "/admin/products" },
    { label: "Archived", value: archivedCount, icon: ArchiveX, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Revenue, orders and sales analytics arrive in a later phase — this is the
        catalog snapshot for now.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-border bg-paper p-5 transition-colors hover:border-gold/40"
          >
            <Icon className="h-5 w-5 text-gold-dark" />
            <p className="mt-3 font-display text-3xl text-navy">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
