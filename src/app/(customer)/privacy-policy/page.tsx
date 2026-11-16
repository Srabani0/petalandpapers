import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Petal & Papers collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: 7 August 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-lg text-navy">1. What We Collect</h2>
            <p className="mt-2 text-muted">
              When you create an account, place an order, or submit a customization request, we
              collect your name, email address, phone number, delivery address(es), order
              history, and any photos or notes you upload for a personalized product. If you
              contact us, we also keep a record of that conversation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">2. How We Use It</h2>
            <p className="mt-2 text-muted">
              We use your information to process and fulfil orders, create your customized
              products, send order and account emails (confirmations, status updates, password
              resets), respond to your questions, and improve the site. We do not sell your
              personal information to anyone.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">3. Photos You Upload</h2>
            <p className="mt-2 text-muted">
              Photos and reference images you upload for a customized order are used only to
              design and produce that order and to show you a design preview for approval. We
              don&apos;t reuse your personal photos for marketing without asking you first.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">4. Payments</h2>
            <p className="mt-2 text-muted">
              Online payments are processed by Razorpay. We never see or store your full card,
              UPI, or net banking credentials — Razorpay handles that securely on their end. If
              you choose Cash on Delivery, no online payment details are collected at all.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">5. Other Services We Use</h2>
            <p className="mt-2 text-muted">
              We use Cloudinary to host product and customization photos, and Brevo to send
              transactional emails (order confirmations, status updates, verification links).
              These providers only receive the information needed to perform that specific job.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">6. Cookies</h2>
            <p className="mt-2 text-muted">
              We use a small number of essential cookies to keep you signed in and to remember
              your cart. We don&apos;t use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">7. Your Choices</h2>
            <p className="mt-2 text-muted">
              You can update your profile and address details any time from your account. To
              request a copy of your data, ask us to correct it, or ask us to delete your
              account, email us — we&apos;ll respond within a reasonable time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy">8. Contact</h2>
            <p className="mt-2 text-muted">
              Questions about this policy? Reach us at{" "}
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
