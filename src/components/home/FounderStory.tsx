"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Flower2, Heart, Quote } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";

export function FounderStory({
  photoUrl,
  heading,
  message,
  founderName,
}: {
  photoUrl: string | null;
  heading: string;
  message: string;
  founderName: string;
}) {
  return (
    <Section className="bg-paper">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border-4 border-cream bg-cream-dark shadow-[0_20px_50px_-20px_rgba(30,42,74,0.3)] ring-1 ring-border">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={founderName}
                fill
                sizes="(min-width: 768px) 380px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gold/40">
                <Heart className="h-14 w-14" strokeWidth={1} />
              </div>
            )}
          </div>
          <span className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-cream shadow-lg">
            <Quote className="h-5 w-5" />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <h2 className="font-display text-3xl text-navy sm:text-4xl">{heading}</h2>

          <div className="mt-4 flex items-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold/50" />
            <Flower2 className="h-4 w-4 text-blush-dark" strokeWidth={1.5} />
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <p className="mt-5 max-w-lg whitespace-pre-line text-base leading-relaxed text-muted">
            {message}
          </p>

          <p className="mt-6 font-script text-3xl text-gold-dark">{founderName}</p>
        </motion.div>
      </Container>
    </Section>
  );
}
