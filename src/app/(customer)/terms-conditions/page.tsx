import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you shop with Petal & Papers.",
  alternates: { canonical: "/terms-conditions" },
};

export default function TermsConditionsPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-muted">Last updated: 7 August 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-lg text-navy">1. About These Terms</h2>
            <p className="mt-2 text-muted">
              These terms govern your use of Petal &amp; Papers and any order you place with us.
              By creating an account or placing an order, you agree to them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">2. Your Account</h2>
            <p className="mt-2 text-muted">
              You&apos;re responsible for keeping your login details private and for the accuracy
              of the information you give us (delivery address, phone number, etc.), since we
              rely on it to fulfil your order correctly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">3. Orders &amp; Pricing</h2>
            <p className="mt-2 text-muted">
              Prices are shown in Indian Rupees (₹) and include applicable taxes unless stated
              otherwise. We reserve the right to correct pricing or listing errors and to cancel
              an order (with a full refund) if an item turns out to be unavailable.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">4. Customized Products</h2>
            <p className="mt-2 text-muted">
              For customizable products, you provide text, photos, and preferences that we use to
              hand-make your item. You confirm you have the right to share any photo you upload,
              and you grant us permission to use it solely to produce and, where applicable,
              preview your order. Because these pieces are made specifically for you, please
              double-check spellings, dates, and photos before submitting — see our{" "}
              <a
                href="/refund-policy"
                className="text-gold-dark underline underline-offset-4"
              >
                Refund &amp; Cancellation Policy
              </a>{" "}
              for how changes and cancellations work once production has started.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">5. Payments</h2>
            <p className="mt-2 text-muted">
              We accept UPI, cards, net banking, and wallets via Razorpay, as well as Cash on
              Delivery where available. Your order is confirmed once payment succeeds (or, for
              Cash on Delivery, once it&apos;s placed).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">6. Intellectual Property</h2>
            <p className="mt-2 text-muted">
              The Petal &amp; Papers name, logo, and site content belong to us. Photos and
              details you upload for your own customized order remain yours.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">7. Limitation of Liability</h2>
            <p className="mt-2 text-muted">
              Handmade items may vary slightly from photos shown on the site — that&apos;s part
              of what makes them handmade. We aren&apos;t liable for indirect or incidental
              losses arising from the use of our products or site, to the extent permitted by
              law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">8. Changes to These Terms</h2>
            <p className="mt-2 text-muted">
              We may update these terms from time to time; the &quot;last updated&quot; date
              above will reflect the latest version.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">9. Contact</h2>
            <p className="mt-2 text-muted">
              Questions? Reach us at{" "}
              <a
                href="mailto:srabaninahak664@gmail.com"
                className="text-gold-dark underline underline-offset-4"
              >
                srabaninahak664@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
