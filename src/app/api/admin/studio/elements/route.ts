import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError } from "@/lib/api-response";
import { uploadImage, isAllowedImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";

const MAX_FILES_PER_UPLOAD = 20;

/** Bulk-uploads sticker/prop elements (ideally transparent PNGs) into a studio category. */
export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Invalid form submission.", 400);

  const categoryId = String(form.get("categoryId") ?? "");
  const group = String(form.get("group") ?? "").trim().slice(0, 40) || "Stickers";
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (!categoryId) return jsonError("Missing category.", 400);
  if (files.length === 0) return jsonError("Choose at least one image.", 400);
  if (files.length > MAX_FILES_PER_UPLOAD) return jsonError(`Upload at most ${MAX_FILES_PER_UPLOAD} at a time.`, 400);
  if (files.some((f) => !isAllowedImage(f))) {
    return jsonError("Only JPEG, PNG, WebP or AVIF images up to 10 MB are allowed.", 400);
  }

  const category = await prisma.designCategory.findUnique({ where: { id: categoryId } });
  if (!category) return jsonError("Studio category not found.", 404);

  try {
    const start = await prisma.designElement.count({ where: { categoryId } });
    const created = [];
    for (const [i, file] of files.entries()) {
      const { url, publicId } = await uploadImage(Buffer.from(await file.arrayBuffer()), "studio/elements");
      created.push(
        await prisma.designElement.create({
          data: {
            categoryId,
            group,
            name: file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 60) || "Element",
            imageUrl: url,
            cloudinaryId: publicId,
            sortOrder: start + i,
          },
        }),
      );
    }
    return NextResponse.json({ elements: created }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] element upload failed:", error);
    return jsonError("Upload failed. Please try again.", 500);
  }
}
