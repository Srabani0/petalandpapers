import { ChevronDown } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { HOME_FAQS } from "@/lib/seo/faq";

/** Native <details> accordion: answers stay in the HTML for crawlers + AI, no JS needed. */
export function Faq() {
  return (
    <Section className="py-12 sm:py-16">
      <JsonLd data={faqJsonLd(HOME_FAQS.map((f) => ({ question: f.question, answer: f.answer })))} />
      <Container className="max-w-3xl">
        <h2 className="text-center font-display text-2xl text-navy sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-paper">
          {HOME_FAQS.map((faq) => (
            <details key={faq.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base text-navy [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-gold-dark transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
