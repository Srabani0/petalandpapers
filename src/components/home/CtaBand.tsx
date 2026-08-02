import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <Section className="bg-navy">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-3xl text-cream sm:text-4xl">
          Have something special in mind?
        </h2>
        <p className="max-w-xl text-cream/70">
          Tell us the occasion, the person, the story — we&apos;ll help you turn it
          into a keepsake they&apos;ll hold onto for years.
        </p>
        <Link
          href="/shop?customizable=true"
          className={buttonVariants({ size: "lg" })}
        >
          Start Customizing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Container>
    </Section>
  );
}
