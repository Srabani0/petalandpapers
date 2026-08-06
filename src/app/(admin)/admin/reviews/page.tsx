import type { Metadata } from "next";
import type { ReviewStatus } from "@prisma/client";
import { listReviewsForAdmin } from "@/lib/reviews";
import { ReviewStatusFilter } from "@/components/admin/ReviewStatusFilter";
import { ReviewCard } from "@/components/admin/ReviewCard";

export const metadata: Metadata = { title: "Reviews" };

const VALID_STATUSES: ReviewStatus[] = ["PENDING", "APPROVED", "HIDDEN"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = VALID_STATUSES.includes(statusParam as ReviewStatus)
    ? (statusParam as ReviewStatus)
    : undefined;

  const reviews = await listReviewsForAdmin(status);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy">Reviews</h1>
          <p className="mt-1 text-sm text-muted">Moderate customer ratings and feedback.</p>
        </div>
        <ReviewStatusFilter />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-paper p-12 text-center text-muted">
            No reviews here yet.
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                id: review.id,
                rating: review.rating,
                title: review.title,
                body: review.body,
                images: review.images,
                status: review.status,
                adminNote: review.adminNote,
                createdAt: review.createdAt.toISOString(),
                customer: review.customer,
                product: review.product,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
