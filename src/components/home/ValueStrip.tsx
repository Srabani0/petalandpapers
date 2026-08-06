"use client";

import { motion } from "framer-motion";
import { HandHeart, Gem, Gift, Infinity as InfinityIcon, Leaf } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HandHeart,
    title: "Handmade with Love",
    description: "Every piece hand-crocheted and finished by hand.",
  },
  {
    icon: Gem,
    title: "Premium Quality",
    description: "Fine materials, built to be kept for years.",
  },
  {
    icon: Gift,
    title: "Perfect Gift",
    description: "Thoughtfully packaged and ready to gift.",
  },
  {
    icon: InfinityIcon,
    title: "Everlasting Flowers",
    description: "Soft blooms that never wilt or fade.",
  },
  {
    icon: Leaf,
    title: "Eco Friendly",
    description: "Reusable materials, mindfully made.",
  },
];

export function ValueStrip() {
  return (
    <div className="border-y border-border bg-paper/70">
      <Container>
        <div className="flex gap-0 overflow-x-auto py-8 sm:overflow-visible sm:py-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={cn(
                "flex min-w-[168px] flex-1 shrink-0 flex-col items-center gap-2.5 px-5 text-center sm:min-w-0 sm:shrink",
                i > 0 && "border-l border-border/70",
              )}
            >
              <motion.span
                whileHover={{ scale: 1.12, rotate: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold-dark"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </motion.span>
              <p className="font-display text-sm text-navy sm:text-base">{title}</p>
              <p className="text-xs text-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
