"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";

export interface ReviewCardData {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  status: "PENDING" | "APPROVED" | "HIDDEN";
  adminNote: string | null;
  createdAt: string;
  customer: { name: string; email: string };
  product: { name: string };
}

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  HIDDEN: "neutral",
} as const;

export function ReviewCard({ review }: { review: ReviewCardData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moderate(status: "APPROVED" | "HIDDEN") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't update this review.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-navy">{review.product.name}</p>
          <p className="text-sm text-muted">
            {review.customer.name} · {review.customer.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StarRating value={review.rating} size="sm" />
          <Badge variant={STATUS_VARIANT[review.status]}>{review.status}</Badge>
        </div>
      </div>

      <div className="mt-3">
        {review.title ? <p className="font-medium text-navy">{review.title}</p> : null}
        <p className="mt-1 text-sm text-ink">{review.body}</p>
      </div>

      {review.images.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.images.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="relative h-16 w-16 overflow-hidden rounded-md border border-border bg-cream-dark"
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </a>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted">
        {new Date(review.createdAt).toLocaleDateString("en-IN")}
      </p>

      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}

      <div className="mt-4 flex gap-2">
        {review.status !== "APPROVED" ? (
          <Button type="button" size="sm" disabled={busy} onClick={() => moderate("APPROVED")}>
            Approve
          </Button>
        ) : null}
        {review.status !== "HIDDEN" ? (
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => moderate("HIDDEN")}>
            Hide
          </Button>
        ) : null}
      </div>
    </div>
  );
}
