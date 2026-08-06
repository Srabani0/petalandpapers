"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flower2, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BouquetShowcase, type ShowcaseImage } from "@/components/home/BouquetShowcase";

export function Hero({
  eyebrowText,
  headingLine,
  headingScript,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  showcaseImages,
}: {
  eyebrowText: string;
  headingLine: string;
  headingScript: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  showcaseImages: ShowcaseImage[];
}) {
  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden bg-gradient-to-b from-blush-light/50 via-cream to-cream"
    >
      {/* very low-opacity decorative corner florals */}
      <Flower2
        aria-hidden
        strokeWidth={0.75}
        className="pointer-events-none absolute -top-10 -left-10 h-56 w-56 rotate-[-15deg] text-gold/10 sm:h-72 sm:w-72"
      />
      <Flower2
        aria-hidden
        strokeWidth={0.75}
        className="pointer-events-none absolute -right-12 -bottom-16 h-64 w-64 rotate-[20deg] text-blush-dark/10 sm:h-80 sm:w-80"
      />

      {/* slow-drifting background blobs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blush/25 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gold/15 blur-3xl"
      />

      {/* subtle paper texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-ink)_1px,transparent_0)] opacity-[0.03] [background-size:22px_22px]" />

      <Container className="relative grid items-center gap-10 py-10 sm:py-14 md:grid-cols-[2fr_3fr] md:gap-12 md:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blush-dark/30 bg-blush/30 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-dark">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrowText}
          </span>

          <h1 className="mt-5 font-display text-3xl leading-[1.08] text-navy sm:text-4xl lg:text-5xl">
            {headingLine}
            <br />
            <span className="font-script text-4xl leading-tight text-gold-dark sm:text-5xl lg:text-6xl">
              {headingScript}
            </span>
          </h1>

          <div className="mt-4 flex items-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold/50" />
            <Flower2 className="h-4 w-4 text-blush-dark" strokeWidth={1.5} />
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={primaryCtaHref}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-dark px-7 py-3 text-sm font-semibold tracking-wide text-cream shadow-lg shadow-gold/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/35"
            >
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href={secondaryCtaHref}
              className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-paper/60 px-5 py-2.5 text-sm font-medium text-navy backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold-dark"
            >
              {secondaryCtaLabel}
            </Link>
          </div>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-5">
            {[
              ["Handmade", "to order"],
              ["Personalized", "every detail"],
              ["Packaged", "with care"],
            ].map(([top, bottom]) => (
              <div key={top}>
                <dt className="font-display text-base text-navy sm:text-lg">{top}</dt>
                <dd className="text-xs text-muted">{bottom}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <BouquetShowcase images={showcaseImages} />
      </Container>
    </section>
  );
}
