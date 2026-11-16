import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "How cancellations, refunds and damaged-item claims work for handmade, made-to-order gifts at Petal & Papers.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: 7 August 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-lg text-navy">1. Why This Is Different</h2>
            <p className="mt-2 text-muted">
              Most of what we make is handmade to order, often personalized around your photos
              and details. That means once we start production, materials and time have already
              gone into your specific piece — so our cancellation window is shorter than a
              typical mass-produced store.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">2. Cancelling an Order</h2>
            <p className="mt-2 text-muted">
              You can cancel free of charge any time before we&apos;ve started production —
              this covers the window while your order is still &quot;Pending&quot; or
              &quot;Confirmed&quot; in your order tracking. To cancel, email us at{" "}
              <a
                href="mailto:srabaninahak664@gmail.com"
                className="text-gold-dark underline underline-offset-4"
              >
                srabaninahak664@gmail.com
              </a>{" "}
              or message us on WhatsApp with your order number as soon as possible. Once an order
              has moved into production, we may not be able to cancel it, but reach out anyway —
              we&apos;ll always try to help.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">3. Refunds</h2>
            <p className="mt-2 text-muted">
              Approved refunds for online payments are credited back to your original payment
              method (UPI, card, net banking, or wallet) via Razorpay, typically within 5–7
              business days. Cash on Delivery orders that are cancelled before dispatch
              don&apos;t involve a refund, since no payment was collected.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">4. Damaged or Incorrect Items</h2>
            <p className="mt-2 text-muted">
              If your order arrives damaged, defective, or different from what you ordered,
              contact us within 48 hours of delivery with a photo of the item and its packaging.
              We&apos;ll arrange a replacement or a refund, whichever makes sense for the issue.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">5. What Isn&apos;t Covered</h2>
            <p className="mt-2 text-muted">
              Because personalized items are made specifically for you, we can&apos;t accept a
              return simply for a change of mind once production has begun. Minor natural
              variation in handmade materials (colour, texture, exact shape) isn&apos;t
              considered a defect.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">6. Design Approval Orders</h2>
            <p className="mt-2 text-muted">
              For products that include a design preview step, please review the preview
              carefully before approving it — production begins right after your approval, so
              changes requested after that point may not be possible.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">7. Contact</h2>
            <p className="mt-2 text-muted">
              For any cancellation, refund, or delivery issue, email{" "}
              <a
                href="mailto:srabaninahak664@gmail.com"
                className="text-gold-dark underline underline-offset-4"
              >
                srabaninahak664@gmail.com
              </a>{" "}
              or use the WhatsApp button on the site — we usually reply fast.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
