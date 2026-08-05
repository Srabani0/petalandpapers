import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadImage, CloudinaryNotConfiguredError, isAllowedImage } from "@/lib/cloudinary";
import { jsonError } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return jsonError("Product not found.", 404);

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
    const { url, publicId } = await uploadImage(buffer, "products");

    const existingCount = await prisma.productImage.count({ where: { productId: id } });

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        cloudinaryId: publicId,
        url,
        isPrimary: existingCount === 0,
        sortOrder: existingCount,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return jsonError(error.message, 503);
    }
    console.error("[images] upload failed:", error);
    return jsonError("Image upload failed. Please try again.", 500);
  }
}
