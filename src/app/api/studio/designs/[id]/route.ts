import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError } from "@/lib/api-response";
import { CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { deleteDesign, isAcceptableRender, saveDesign } from "@/lib/studio/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Saves a design: multipart with `canvas` (JSON), `preview` and `print`
 * (images rendered in the browser from that exact canvas).
 */
export async function PUT(request: Request, { params }: Ctx) {
  const session = await requireUser(request);
  if (!session) return jsonError("Your session expired — please sign in again.", 401);
  const { id } = await params;

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Invalid save request.", 400);

  let canvas: unknown;
  try {
    canvas = JSON.parse(String(form.get("canvas") ?? ""));
  } catch {
    return jsonError("Invalid design data.", 400);
  }
  const preview = form.get("preview");
  const print = form.get("print");
  if (!isAcceptableRender(preview) || !isAcceptableRender(print)) {
    return jsonError("The design image is missing or too large. Please try saving again.", 400);
  }

  try {
    const result = await saveDesign(session.sub, id, { canvas, preview, print });
    if ("error" in result) return jsonError(result.error, result.status ?? 400);
    return NextResponse.json({
      design: {
        id: result.design.id,
        previewUrl: result.design.previewUrl,
        updatedAt: result.design.updatedAt,
        inCart: result.design.cartItems.length > 0,
      },
    });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[studio] design save failed:", error);
    return jsonError("Couldn't save your design. Please try again.", 500);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const result = await deleteDesign(session.sub, id);
  if ("error" in result) return jsonError(result.error, result.status ?? 400);
  return NextResponse.json({ ok: true });
}
