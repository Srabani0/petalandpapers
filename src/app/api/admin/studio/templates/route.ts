import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError } from "@/lib/api-response";
import { uploadImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { readTemplateForm } from "@/lib/studio/template-form";

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const form = await readTemplateForm(request);
  if ("error" in form) return jsonError(form.error, 400);
  const { meta, doc, thumbnail } = form;

  const category = await prisma.designCategory.findUnique({ where: { id: meta.categoryId } });
  if (!category) return jsonError("Studio category not found.", 404);

  try {
    const thumb = thumbnail
      ? await uploadImage(Buffer.from(await thumbnail.arrayBuffer()), "studio/thumbnails")
      : null;

    const template = await prisma.designTemplate.create({
      data: {
        categoryId: meta.categoryId,
        name: meta.name,
        sizeLabel: meta.sizeLabel,
        width: meta.width,
        height: meta.height,
        price: meta.price,
        isActive: meta.isActive,
        sortOrder: meta.sortOrder,
        canvas: doc as unknown as Prisma.InputJsonValue,
        thumbnailUrl: thumb?.url ?? null,
      },
    });
    return NextResponse.json({ template: { id: template.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] template create failed:", error);
    return jsonError("Couldn't save the template. Please try again.", 500);
  }
}
