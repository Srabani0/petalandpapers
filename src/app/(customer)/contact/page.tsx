import type { Metadata } from "next";
import { Mail, Clock, MapPin } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Contact" };

const CONTACT_DETAILS = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "srabaninahak664@gmail.com",
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

        <p className="mx-auto mt-10 max-w-md text-center text-sm text-muted">
          A contact form is on its way — for now, the fastest way to reach us is by
          email at{" "}
          <a href="mailto:srabaninahak664@gmail.com" className="text-gold-dark underline underline-offset-4">
            srabaninahak664@gmail.com
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
