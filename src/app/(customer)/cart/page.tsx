import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Section } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateCart, computeCartTotals } from "@/lib/cart";
import { CartView } from "@/components/cart/CartView";
import { toCartItemView } from "@/lib/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/cart");

  const cart = await getOrCreateCart(session.sub);
  const totals = computeCartTotals(cart);

  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl text-navy">Your Cart</h1>
        <div className="mt-8">
          <CartView
            initialItems={cart.items.map((item) =>
              toCartItemView({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toString(),
                customizationId: item.customizationId,
                product: {
                  name: item.product.name,
                  stock: item.product.stock,
                  images: item.product.images,
                },
              }),
            )}
            initialTotals={totals}
            initialCouponCode={cart.coupon?.code ?? null}
          />
        </div>
      </Container>
    </Section>
  );
}
