"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";

interface CategoryTile {
  slug: string;
  name: string;
  imageUrl: string | null;
}

export function CraftCategories({ categories }: { categories: CategoryTile[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  function scroll(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <Section className="bg-[#FAF8F5] py-12 sm:py-14">
      <Container>
        <h2 className="text-center font-display text-2xl text-[#2F2F2F] sm:text-3xl">
          Shop by Category
        </h2>

        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll categories left"
            className="absolute top-1/2 left-0 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8DED3] bg-white text-[#2F2F2F] shadow-md transition-all duration-300 hover:border-[#C89B6D] hover:text-[#C89B6D] hover:shadow-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex snap-x snap-proximity gap-6 overflow-x-auto scroll-smooth px-1 pb-3 sm:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map(({ slug, name, imageUrl }, i) => (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.05, ease: "easeOut" }}
                className="flex shrink-0 snap-start justify-center"
              >
                <Link
                  href={`/shop?category=${slug}`}
                  className="group flex w-24 cursor-pointer flex-col items-center gap-3 sm:w-28"
                >
                  <span className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-full border-[3px] border-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.15)] ring-1 ring-[#E8DED3] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-3 group-hover:shadow-[0_10px_24px_-8px_rgba(200,155,109,0.45)] group-hover:ring-[#C89B6D]">
                    <span className="relative h-full w-full overflow-hidden rounded-full bg-[#FAF8F5]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={name}
                          fill
                          sizes="90px"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[#C89B6D]">
                          <Gift className="h-7 w-7" strokeWidth={1.5} />
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="text-center font-display text-sm text-[#2F2F2F] transition-colors duration-300 group-hover:text-[#C89B6D]">
                    {name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll categories right"
            className="absolute top-1/2 right-0 z-10 flex h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8DED3] bg-white text-[#2F2F2F] shadow-md transition-all duration-300 hover:border-[#C89B6D] hover:text-[#C89B6D] hover:shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Container>
    </Section>
  );
}
