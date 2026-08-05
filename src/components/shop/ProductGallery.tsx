"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  altText: string | null;
}

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-cream-dark text-muted">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-cream-dark">
        <Image
          src={images[active].url}
          alt={images[active].altText ?? name}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors",
                active === index ? "border-gold" : "border-transparent",
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
