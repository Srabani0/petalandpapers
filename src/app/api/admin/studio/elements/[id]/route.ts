import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Removes an element from the library. The Cloudinary file is intentionally
 * kept: designs and templates that already placed this sticker reference its
 * URL directly, and deleting the file would blank it out of their prints.
 */
export async function DELETE(request: Request, { params }: Ctx) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;
  await prisma.designElement.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { group?: unknown; name?: unknown } | null;
  const group = typeof body?.group === "string" ? body.group.trim().slice(0, 40) : undefined;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : undefined;
  if (!group && !name) return jsonError("Nothing to update.", 400);

  const element = await prisma.designElement
    .update({ where: { id }, data: { ...(group ? { group } : {}), ...(name ? { name } : {}) } })
    .catch(() => null);
  if (!element) return jsonError("Element not found.", 404);
  return NextResponse.json({ element });
}
