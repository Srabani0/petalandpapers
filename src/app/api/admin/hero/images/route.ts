import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadImage, CloudinaryNotConfiguredError, isAllowedImage } from "@/lib/cloudinary";
import { getHeroContent, MAX_HERO_IMAGES } from "@/lib/hero";
import { jsonError } from "@/lib/api-response";

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const content = await getHeroContent();
  if (content.images.length >= MAX_HERO_IMAGES) {
    return jsonError(`You can only have ${MAX_HERO_IMAGES} hero photos — remove one first.`, 400);
  }

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
    const { url, publicId } = await uploadImage(buffer, "hero");

    const image = await prisma.heroImage.create({
      data: {
        heroContentId: content.id,
        cloudinaryId: publicId,
        url,
        sortOrder: content.images.length,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return jsonError(error.message, 503);
    }
    console.error("[hero images] upload failed:", error);
    return jsonError("Image upload failed. Please try again.", 500);
  }
}
