import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadImage, CloudinaryNotConfiguredError, isAllowedImage } from "@/lib/cloudinary";
import { jsonError } from "@/lib/api-response";

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return jsonError("No file uploaded.", 400);
  }
  if (!isAllowedImage(file)) {
    return jsonError("Only JPEG, PNG, WebP, or AVIF images up to 10 MB are allowed.", 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadImage(buffer, "founder-story");
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return jsonError(error.message, 503);
    }
    console.error("[founder-story] image upload failed:", error);
    return jsonError("Image upload failed. Please try again.", 500);
  }
}
