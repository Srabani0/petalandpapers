"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={cn(dim, n <= value ? "fill-gold text-gold" : "text-border")} />
        </button>
      ))}
    </div>
  );
}
