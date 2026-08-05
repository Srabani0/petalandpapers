import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { jsonError } from "@/lib/api-response";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id, imageId } = await params;

  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) return jsonError("Image not found.", 404);

  try {
    await deleteImage(image.cloudinaryId);
  } catch (error) {
    if (!(error instanceof CloudinaryNotConfiguredError)) {
      console.error("[images] Cloudinary delete failed (continuing):", error);
    }
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  // If we just deleted the primary image, promote the next one.
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  return NextResponse.json({ ok: true });
}
