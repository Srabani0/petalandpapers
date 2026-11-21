"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Flower2, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";

/** Friendly fallback when a page crashes — the header and footer stay usable. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-light text-blush-dark">
        <Flower2 className="h-8 w-8" strokeWidth={1.4} />
      </span>
      <h1 className="mt-6 font-display text-2xl text-navy sm:text-3xl">Oops — a petal fell off</h1>
      <p className="mt-3 text-muted">
        Something went wrong while loading this page. Please try again — if it keeps happening, message us on WhatsApp
        and we&apos;ll sort it out.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
      {error.digest ? <p className="mt-6 text-xs text-muted/70">Error code: {error.digest}</p> : null}
    </div>
  );
}
