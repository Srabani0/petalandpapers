import { Quote } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";

export interface TestimonialData {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  customerName: string;
  productName: string;
}

export function Testimonials({ reviews }: { reviews: TestimonialData[] }) {
  if (reviews.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Loved By Our Customers"
          title="What They're Saying"
          description="Real words from customers who turned their story into a keepsake."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-paper p-6"
            >
              <Quote className="h-5 w-5 text-gold" />
              <StarRating value={review.rating} size="sm" />
              {review.title ? (
                <p className="font-display text-base text-navy">{review.title}</p>
              ) : null}
              <p className="text-sm text-muted line-clamp-4">{review.body}</p>
              <div className="mt-auto pt-2 text-xs text-muted">
                <span className="font-medium text-navy">{review.customerName}</span> ·{" "}
                {review.productName}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
