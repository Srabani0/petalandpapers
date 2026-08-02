"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sage/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />

      <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-dark">
            <Sparkles className="h-3.5 w-3.5" />
            Handcrafted &middot; Personalized &middot; Made with Love
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.1] text-navy sm:text-5xl lg:text-6xl">
            Gifts that feel like they were made
            <span className="text-gold-dark"> just for you.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            From scrapbooks that hold your favourite memories to bouquets that never
            wilt — every piece at Petal &amp; Papers is designed around your story,
            then handcrafted to order.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Shop the Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop?customizable=true"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Start a Custom Gift
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              ["Handmade", "to order"],
              ["Personalized", "every detail"],
              ["Packaged", "with care"],
            ].map(([top, bottom]) => (
              <div key={top}>
                <dt className="font-display text-lg text-navy">{top}</dt>
                <dd className="text-xs text-muted">{bottom}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full border border-gold/25" />
          <div className="absolute inset-6 rounded-full border border-sage/30" />
          <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-paper shadow-[0_20px_60px_-15px_rgba(30,42,74,0.25)] sm:h-80 sm:w-80">
            <Image
              src="/brand/logo-mark.png"
              alt="Petal & Papers"
              width={260}
              height={260}
              className="h-48 w-48 rounded-full object-cover sm:h-60 sm:w-60"
              priority
            />
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
