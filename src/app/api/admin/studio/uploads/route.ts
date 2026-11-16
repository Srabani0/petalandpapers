import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError } from "@/lib/api-response";
import { uploadImage, isAllowedImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";

/** Generic admin image upload for the template editor (backgrounds, one-off images, covers). */
export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("No file uploaded.", 400);
  if (!isAllowedImage(file)) return jsonError("Only JPEG, PNG, WebP or AVIF images up to 10 MB are allowed.", 400);

  try {
    const { url } = await uploadImage(Buffer.from(await file.arrayBuffer()), "studio/assets");
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] admin upload failed:", error);
    return jsonError("Upload failed. Please try again.", 500);
  }
}
