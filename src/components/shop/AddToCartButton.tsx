"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";

export function AddToCartButton({
  productId,
  disabled,
  isCustomizable,
  customizeHref,
}: {
  productId: string;
  disabled: boolean;
  isCustomizable: boolean;
  /** Link to the customize flow, when the product has a real form ready. */
  customizeHref?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isCustomizable && customizeHref && !disabled) {
    return (
      <Link href={customizeHref} className={buttonVariants({ size: "lg" })}>
        <Sparkles className="h-4 w-4" />
        Customize This Gift
      </Link>
    );
  }

  async function handleClick() {
    if (disabled) return;
    if (isCustomizable && !customizeHref) {
      setMessage("This product's customization form isn't ready yet — please check back soon.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.status === 401) {
        router.push(`/login?from=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Couldn't add this to your cart.");
        return;
      }
      setAdded(true);
      router.refresh();
    } catch {
      setMessage("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button size="lg" disabled={disabled || busy} className="w-full sm:w-auto" onClick={handleClick}>
        {isCustomizable ? <Sparkles className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {disabled
          ? "Out of Stock"
          : busy
            ? "Adding…"
            : isCustomizable
              ? "Customize This Gift"
              : "Add to Cart"}
      </Button>
      {added ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-sage-dark">
          <CheckCircle2 className="h-4 w-4" />
          Added to your cart.{" "}
          <Link href="/cart" className="font-medium underline underline-offset-2">
            View cart
          </Link>
        </p>
      ) : message ? (
        <p className="mt-2 text-sm text-muted">{message}</p>
      ) : null}
    </div>
  );
}
