import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Petal & Papers ships across India. Delivery is ₹99 per order, free above ₹999, typically 3–10 business days for made-to-order gifts.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">Shipping Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: 7 August 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-lg text-navy">1. Where We Ship</h2>
            <p className="mt-2 text-muted">
              We ship across India. Enter your delivery address at checkout to see availability
              and charges for your area.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">2. Delivery Time</h2>
            <p className="mt-2 text-muted">
              Because most items are made to order, delivery time varies by product — you&apos;ll
              see an estimate (typically 3–10 business days) on each product page before you
              order. If you&apos;ve chosen rush processing at checkout, your order is prioritized
              for faster handling.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">3. Delivery Charges</h2>
            <p className="mt-2 text-muted">
              Delivery is ₹99 per order, and free on orders above ₹999. Any coupon discount is
              applied before this threshold is checked. If you add rush processing (+₹149) or
              gift wrap (+₹49) at checkout, those are shown separately in your order summary.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">4. Tracking Your Order</h2>
            <p className="mt-2 text-muted">
              You can follow your order&apos;s progress any time from your account under
              &quot;My Orders.&quot; Once it ships, we&apos;ll add a courier name and tracking
              number to that page and email you an update.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">5. Delays</h2>
            <p className="mt-2 text-muted">
              Handmade, personalized, and design-approval orders can occasionally take a little
              longer than the estimate, especially around festive seasons. If your order is
              running late, contact us and we&apos;ll give you a real update.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">6. Contact</h2>
            <p className="mt-2 text-muted">
              Shipping questions? Email{" "}
              <a
                href="mailto:srabaninahak664@gmail.com"
                className="text-gold-dark underline underline-offset-4"
              >
                srabaninahak664@gmail.com
              </a>{" "}
              or message us on WhatsApp.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
