import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { jsonError } from "@/lib/api-response";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { imageId } = await params;

  const image = await prisma.heroImage.findUnique({ where: { id: imageId } });
  if (!image) return jsonError("Image not found.", 404);

  try {
    await deleteImage(image.cloudinaryId);
  } catch (error) {
    if (!(error instanceof CloudinaryNotConfiguredError)) {
      console.error("[hero images] Cloudinary delete failed (continuing):", error);
    }
  }

  await prisma.heroImage.delete({ where: { id: imageId } });

  return NextResponse.json({ ok: true });
}
