import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Section } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { CheckoutView } from "@/components/cart/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/checkout");

  const cart = await getOrCreateCart(session.sub);
  if (cart.items.length === 0) redirect("/cart");

  const totals = computeCartTotals(cart);
  const addresses = await prisma.address.findMany({
    where: { userId: session.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl text-navy">Checkout</h1>
        <div className="mt-8">
          <CheckoutView
            addresses={addresses}
            totals={totals}
            couponCode={cart.coupon?.code ?? null}
          />
        </div>
      </Container>
    </Section>
  );
}
