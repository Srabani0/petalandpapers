"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flower2, MessageCircleHeart } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";

export function CtaBand() {
  return (
    <Section className="relative overflow-hidden bg-navy">
      {/* very low-opacity decorative corner florals, echoing the hero */}
      <Flower2
        aria-hidden
        strokeWidth={0.75}
        className="pointer-events-none absolute -top-12 -left-12 h-56 w-56 rotate-[-12deg] text-cream/5 sm:h-64 sm:w-64"
      />
      <Flower2
        aria-hidden
        strokeWidth={0.75}
        className="pointer-events-none absolute -right-10 -bottom-14 h-60 w-60 rotate-[18deg] text-gold/10 sm:h-72 sm:w-72"
      />

      {/* slow-drifting glow */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 20, 0], y: [0, -14, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-0 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      <Container className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light">
            <MessageCircleHeart className="h-3.5 w-3.5" />
            Let&apos;s create something together
          </span>

          <h2 className="font-display text-3xl leading-tight text-cream sm:text-4xl">
            Have something special
            <br />
            <span className="font-script text-5xl leading-tight text-gold-light sm:text-6xl">
              in mind?
            </span>
          </h2>

          <div className="flex items-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold/40" />
            <Flower2 className="h-4 w-4 text-gold-light/70" strokeWidth={1.5} />
            <span className="h-px w-10 bg-gold/40" />
          </div>

          <p className="max-w-xl text-cream/70">
            Tell us the occasion, the person, the story — we&apos;ll help you turn it
            into a keepsake they&apos;ll hold onto for years.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/studio"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-dark px-8 py-3.5 text-sm font-semibold tracking-wide text-cream shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Customizing
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/0 px-6 py-3 text-sm font-medium text-cream/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold-light"
            >
              Browse the Collection
            </Link>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
