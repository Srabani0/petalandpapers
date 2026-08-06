"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError, FieldHint } from "@/components/ui/Input";
import { StarRating } from "@/components/ui/StarRating";
import { PhotoUploader } from "@/components/customize/PhotoUploader";

const MAX_REVIEW_PHOTOS = 4;

export function ReviewForm({
  orderId,
  productId,
  productName,
}: {
  orderId: string;
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pick a star rating.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("productId", productId);
      formData.set("rating", String(rating));
      formData.set("title", title);
      formData.set("body", body);
      photos.forEach((file) => formData.append("photos", file));

      const res = await fetch("/api/reviews", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't submit your review.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <Label>Your Rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <Label htmlFor={`title-${productId}`}>Title (optional)</Label>
        <Input
          id={`title-${productId}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>
      <div>
        <Label htmlFor={`body-${productId}`}>Your Review</Label>
        <Textarea
          id={`body-${productId}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={10}
          required
          placeholder={`What did you think of ${productName}?`}
        />
      </div>
      <div>
        <Label>Photos (optional)</Label>
        <FieldHint>Add up to {MAX_REVIEW_PHOTOS}.</FieldHint>
        <div className="mt-2">
          <PhotoUploader files={photos} onChange={setPhotos} max={MAX_REVIEW_PHOTOS} />
        </div>
      </div>

      <FieldError>{error ?? undefined}</FieldError>
      <Button type="submit" size="sm" disabled={busy} className="self-start">
        {busy ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
