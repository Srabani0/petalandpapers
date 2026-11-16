import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Package, MapPin, ShieldCheck, KeyRound } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AddressBook } from "@/components/profile/AddressBook";
import { LogoutButton } from "@/components/profile/LogoutButton";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/profile");

  const [user, addresses, orderCount, wishlistCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, email: true, role: true, createdAt: true },
    }),
    prisma.address.findMany({
      where: { userId: session.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.order.count({ where: { customerId: session.sub } }),
    prisma.wishlistItem.count({ where: { userId: session.sub } }),
  ]);

  if (!user) redirect("/login?from=/profile");

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const memberSince = user.createdAt.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Section>
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-paper p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-2xl text-gold-dark">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl text-navy sm:text-3xl">{user.name}</h1>
              {user.role === "ADMIN" ? <Badge variant="navy">Admin</Badge> : null}
            </div>
            <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-muted">Member since {memberSince}</p>
          </div>
          {user.role === "ADMIN" ? (
            <Link href="/admin" className="shrink-0">
              <Button type="button" variant="outline" size="sm">
                Go to Admin Panel
              </Button>
            </Link>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/orders"
            className="flex items-center gap-4 rounded-xl border border-border bg-paper p-5 transition-colors hover:border-gold/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
              <Package className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg text-navy">{orderCount}</span>
              <span className="block text-sm text-muted">Your Orders</span>
            </span>
          </Link>
          <Link
            href="/wishlist"
            className="flex items-center gap-4 rounded-xl border border-border bg-paper p-5 transition-colors hover:border-gold/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
              <Heart className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg text-navy">{wishlistCount}</span>
              <span className="block text-sm text-muted">Wishlist Items</span>
            </span>
          </Link>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-dark" />
            <h2 className="font-display text-xl text-navy">Saved Addresses</h2>
          </div>
          <p className="mt-1 text-sm text-muted">Manage the delivery addresses you use at checkout.</p>
          <div className="mt-4">
            <AddressBook addresses={addresses} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-xl border border-border bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-navy">Account Security</p>
              <p className="text-sm text-muted">Reset your password anytime via email OTP.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/forgot-password">
              <Button type="button" variant="outline" size="sm">
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </Container>
    </Section>
  );
}
