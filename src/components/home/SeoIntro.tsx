import Link from "next/link";
import { Container, Section } from "@/components/ui/Container";
import { categoryPath } from "@/lib/seo/site";

/**
 * Real, readable copy that tells search engines (and shoppers) exactly what the
 * store sells and who it's for. Internal links go to category landing pages,
 * which passes ranking signal to them.
 */
export function SeoIntro({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <Section className="bg-paper py-12 sm:py-16">
      <Container className="max-w-4xl">
        <h2 className="text-center font-display text-2xl text-navy sm:text-3xl">
          Handmade &amp; Personalized Gifts, Delivered Across India
        </h2>
        <div className="mt-6 space-y-4 leading-relaxed text-muted">
          <p>
            Petal &amp; Papers is where thoughtful gifting begins. Every scrapbook, explosion box,
            crochet bouquet, keychain, photo frame and gift hamper is crafted by hand and made to
            order — and most can be personalized with your photos, names, favourite colours and a
            message only you could write. It&apos;s the difference between a gift that&apos;s
            bought and a gift that&apos;s meant.
          </p>
          <p>
            Looking for a birthday gift for her, an anniversary surprise, a wedding keepsake or a
            heartfelt thank-you? Browse our handmade collections, add your personal touch on the
            product page, and we&apos;ll share a design preview for your approval before we start
            making it. We deliver across India, with Cash on Delivery and secure online payment
            options.
          </p>
        </div>

        {categories.length > 0 ? (
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={categoryPath(c.slug)}
                  className="inline-block rounded-full border border-border bg-cream px-4 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
