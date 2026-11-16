import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError } from "@/lib/api-response";
import { uploadImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { readTemplateForm } from "@/lib/studio/template-form";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const existing = await prisma.designTemplate.findUnique({ where: { id } });
  if (!existing) return jsonError("Template not found.", 404);

  const form = await readTemplateForm(request);
  if ("error" in form) return jsonError(form.error, 400);
  const { meta, doc, thumbnail } = form;

  // Customers' existing designs were copied at this size; changing it would
  // break their layouts, so size is fixed once anyone has used the template.
  if (meta.width !== existing.width || meta.height !== existing.height) {
    const used = await prisma.design.count({ where: { templateId: id } });
    if (used > 0) {
      return jsonError("Customers already have designs at this size. Create a new template for a new size.", 409);
    }
  }

  try {
    const thumb = thumbnail
      ? await uploadImage(Buffer.from(await thumbnail.arrayBuffer()), "studio/thumbnails")
      : null;

    await prisma.designTemplate.update({
      where: { id },
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
        ...(thumb ? { thumbnailUrl: thumb.url } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] template update failed:", error);
    return jsonError("Couldn't save the template. Please try again.", 500);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const used = await prisma.design.count({ where: { templateId: id } });
  if (used > 0) {
    return jsonError(
      `Customers have ${used} design(s) made from this template. Hide it (untick "Active") instead of deleting.`,
      409,
    );
  }
  await prisma.designTemplate.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
