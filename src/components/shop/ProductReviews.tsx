import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  createdAt: Date;
  customer: { name: string };
}

export function ProductReviews({
  reviews,
  count,
  average,
  breakdown,
}: {
  reviews: ReviewItem[];
  count: number;
  average: number;
  breakdown: { star: number; count: number }[];
}) {
  if (count === 0) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-paper p-6">
          <p className="font-display text-5xl text-navy">{average.toFixed(1)}</p>
          <div className="mt-2">
            <StarRating value={Math.round(average)} size="md" />
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Based on {count} review{count === 1 ? "" : "s"}
          </p>

          <div className="mt-5 flex flex-col gap-1.5">
            {breakdown.map(({ star, count: starCount }) => {
              const pct = count > 0 ? Math.round((starCount / count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-muted">
                  <span className="flex w-8 shrink-0 items-center gap-0.5">
                    {star} <Star className="h-3 w-3 fill-gold text-gold" />
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-dark">
                    <span
                      className="block h-full rounded-full bg-gold"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right">{starCount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {reviews.map((review) => {
          const initials = review.customer.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <article key={review.id} className="flex flex-col gap-3 py-6 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-medium text-gold-dark">
                    {initials}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 font-medium text-navy">
                      {review.customer.name}
                      <BadgeCheck className="h-3.5 w-3.5 text-sage-dark" aria-label="Verified purchase" />
                    </p>
                    <p className="text-xs text-muted">
                      {review.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating value={review.rating} size="sm" />
              </div>

              {review.title ? <p className="font-medium text-navy">{review.title}</p> : null}
              <p className="leading-relaxed whitespace-pre-line text-muted">{review.body}</p>

              {review.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {review.images.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-cream-dark",
                        "transition-opacity hover:opacity-90",
                      )}
                    >
                      <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
