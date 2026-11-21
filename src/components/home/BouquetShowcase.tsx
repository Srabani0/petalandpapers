"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShowcaseImage {
  url: string;
  alt: string;
}

/** Handmade pipe-cleaner flowers shown in any slot that has no photo yet. */
const FALLBACK_FLOWERS = [
  { src: "/studio/library/chenille/sunflower-classic.webp", alt: "Handmade pipe-cleaner sunflower", bg: "from-[#fff6d8] to-cream-dark" },
  { src: "/studio/library/chenille/rose-pink.webp", alt: "Handmade pipe-cleaner pink rose", bg: "from-blush-light to-cream-dark" },
  { src: "/studio/library/chenille/daisy-lilac.webp", alt: "Handmade pipe-cleaner lilac daisy", bg: "from-[#efe8fb] to-cream-dark" },
  { src: "/studio/library/chenille/tulip-red.webp", alt: "Handmade pipe-cleaner red tulip", bg: "from-[#fde7e4] to-cream-dark" },
];

const SLOTS = [
  {
    wrap: "md:absolute md:left-0 md:top-6 md:z-10 md:h-[220px] md:w-[44%] md:-rotate-3",
  },
  {
    wrap: "md:absolute md:top-0 md:right-4 md:z-20 md:h-[160px] md:w-[36%] md:rotate-2",
  },
  {
    wrap: "md:absolute md:right-0 md:bottom-0 md:z-30 md:h-[200px] md:w-[42%] md:-rotate-2",
  },
  {
    wrap: "md:absolute md:bottom-4 md:left-[26%] md:z-40 md:h-[145px] md:w-[30%] md:rotate-3",
  },
] as const;

export function BouquetShowcase({ images }: { images: ShowcaseImage[] }) {
  const slots = SLOTS.map((slot, i) => ({ slot, image: images[i] ?? null }));

  return (
    <div className="relative md:h-[420px]">
      {/* soft gradient + abstract blobs behind the bouquets */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-0 right-0 -z-10 h-56 w-56 rounded-full bg-blush/50 blur-3xl sm:h-72 sm:w-72"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -16, 0], y: [0, 14, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl sm:h-64 sm:w-64"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-blush-light/60 via-transparent to-sage/10" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:block">
        {slots.map(({ slot, image }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 32, y: 16 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + i * 0.12 }}
            whileHover={{ y: -8, scale: 1.03 }}
            className={cn(
              "group relative h-36 w-full overflow-hidden rounded-2xl border border-cream bg-paper shadow-[0_18px_40px_-18px_rgba(30,42,74,0.25)] transition-shadow duration-300 hover:shadow-[0_26px_55px_-16px_rgba(30,42,74,0.35)] sm:h-44 md:rounded-3xl",
              slot.wrap,
            )}
          >
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 260px, 45vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className={cn("relative h-full w-full bg-gradient-to-br", FALLBACK_FLOWERS[i % FALLBACK_FLOWERS.length].bg)}>
                <Image
                  src={FALLBACK_FLOWERS[i % FALLBACK_FLOWERS.length].src}
                  alt={FALLBACK_FLOWERS[i % FALLBACK_FLOWERS.length].alt}
                  fill
                  sizes="(min-width: 768px) 260px, 45vw"
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
