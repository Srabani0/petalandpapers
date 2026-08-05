"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialSaved,
  className,
}: {
  productId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    setBusy(true);
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      const res = await fetch(wasSaved ? `/api/wishlist/${productId}` : "/api/wishlist", {
        method: wasSaved ? "DELETE" : "POST",
        headers: wasSaved ? undefined : { "content-type": "application/json" },
        body: wasSaved ? undefined : JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        router.push(`/login?from=${encodeURIComponent(window.location.pathname)}`);
        setSaved(wasSaved);
        return;
      }
      if (!res.ok) {
        setSaved(wasSaved);
        return;
      }
      if (wasSaved) {
        router.refresh();
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-navy shadow-sm backdrop-blur-sm transition-colors hover:bg-paper disabled:opacity-60",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved ? "fill-gold text-gold" : "text-navy")} />
    </button>
  );
}
