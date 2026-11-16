import type { Metadata } from "next";
import { Mail, Clock, MapPin } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE, absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Contact Us – Custom Orders & Gift Enquiries",
  description:
    "Questions about a custom gift, bulk gifting or an existing order? Message Petal & Papers — we reply within 24 hours.",
  alternates: { canonical: "/contact" },
};

const CONTACT_DETAILS = [
  {
    icon: Mail,
    title: "Email Us",
    detail: SITE.email,
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "We usually reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Based In",
    detail: "India, shipping nationwide",
  },
];

export default function ContactPage() {
  return (
    <Section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absoluteUrl("/contact"),
          name: "Contact Petal & Papers",
          about: { "@type": "Organization", name: SITE.name, email: SITE.email },
        }}
      />
      <Container>
        <SectionHeading
          eyebrow="Get in Touch"
          title="We'd Love to Hear From You"
          description="Questions about a custom order, bulk gifting, or just want to say hello — reach out any time."
        />

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {CONTACT_DETAILS.map(({ icon: Icon, title, detail }) => (
            <Card key={title}>
              <CardBody className="flex flex-col items-center gap-2 text-center">
                <Icon className="h-5 w-5 text-gold-dark" />
                <p className="font-display text-base text-navy">{title}</p>
                <p className="text-sm text-muted">{detail}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <ContactForm />
          <p className="mt-6 text-center text-sm text-muted">
            Prefer email? Write to{" "}
            <a href={`mailto:${SITE.email}`} className="text-gold-dark underline underline-offset-4">
              {SITE.email}
            </a>
            .
          </p>
        </div>
      </Container>
    </Section>
  );
}
