import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";
import { uploadImage, isAllowedImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/rate-limit";

/** Customer photo upload for the Design Studio. Signed-in users only. */
export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Please sign in to upload photos.", 401);

  const rate = checkRateLimit(`studio-upload:${session.sub}`, { max: 60, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) return jsonError("You're uploading very quickly — please wait a few minutes.", 429);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("No file uploaded.", 400);
  if (!isAllowedImage(file)) return jsonError("Only JPEG, PNG, WebP or AVIF images up to 10 MB are allowed.", 400);

  try {
    const { url } = await uploadImage(Buffer.from(await file.arrayBuffer()), "designs/photos");
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] photo upload failed:", error);
    return jsonError("Upload failed. Please try again.", 500);
  }
}
