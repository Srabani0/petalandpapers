import { PenLine, ImagePlus, PackageCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    icon: PenLine,
    step: "01",
    title: "Tell Us the Story",
    description:
      "Pick a customizable piece and fill in the details — names, occasion, theme, colours, a personal note.",
  },
  {
    icon: ImagePlus,
    step: "02",
    title: "Upload Your Photos",
    description:
      "Add the photos and reference designs that make this gift unmistakably yours. We'll guide you on what fits best.",
  },
  {
    icon: PackageCheck,
    step: "03",
    title: "We Craft, You Approve",
    description:
      "We handcraft your piece and share a preview before it ships — so nothing goes into production without your okay.",
  },
];

export function CustomizationSteps() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="From Your Idea to Their Hands"
          description="Every custom order goes through the same careful process, so the gift you imagined is the gift that arrives."
        />

        <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
          <div className="pp-divider absolute top-8 right-0 left-0 hidden sm:block" />
          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-cream text-gold-dark shadow-[0_8px_24px_-8px_rgba(166,124,61,0.35)]">
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-4 text-xs font-semibold tracking-[0.2em] text-gold-dark">
                STEP {step}
              </span>
              <h3 className="mt-2 font-display text-xl text-navy">{title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
