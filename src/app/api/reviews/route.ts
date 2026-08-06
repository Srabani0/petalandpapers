import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { reviewSchema } from "@/lib/validations/review";
import { createReview } from "@/lib/reviews";
import { uploadImage, isAllowedImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { jsonError, zodError } from "@/lib/api-response";

const MAX_REVIEW_IMAGES = 4;

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError("Invalid form submission.", 400);

  const parsed = reviewSchema.safeParse({
    orderId: formData.get("orderId"),
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return zodError(parsed.error);

  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length > MAX_REVIEW_IMAGES) {
    return jsonError(`Please add at most ${MAX_REVIEW_IMAGES} photos.`, 400);
  }
  for (const file of photos) {
    if (!isAllowedImage(file)) {
      return jsonError(`"${file.name}" isn't a supported image, or is over 10 MB.`, 400);
    }
  }

  try {
    const images: string[] = [];
    for (const file of photos) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await uploadImage(buffer, "reviews");
      images.push(url);
    }

    const result = await createReview(session.sub, { ...parsed.data, images });
    if ("error" in result) return jsonError(result.error, 400);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return jsonError(error.message, 503);
    }
    console.error("[reviews] submission failed:", error);
    return jsonError("Couldn't submit your review. Please try again.", 500);
  }
}
