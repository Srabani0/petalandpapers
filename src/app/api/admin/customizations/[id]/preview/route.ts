import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadImage, isAllowedImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { sendEmail } from "@/lib/email/brevo";
import { designPreviewReadyEmail } from "@/lib/email/templates";
import { jsonError } from "@/lib/api-response";

/** Admin uploads a design preview — kicks off (or restarts) the customer approval loop. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.customizationRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      product: { select: { name: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });
  if (!existing) return jsonError("Customization request not found.", 404);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("preview");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Please attach a preview image.", 400);
  }
  if (!isAllowedImage(file)) {
    return jsonError("Preview must be a JPEG, PNG, WEBP or AVIF under 10 MB.", 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadImage(buffer, "previews");

    const customizationRequest = await prisma.customizationRequest.update({
      where: { id },
      data: {
        previewDesignUrl: url,
        status: "AWAITING_APPROVAL",
        approvalRequestedAt: new Date(),
      },
    });

    const reviewUrl = existing.order
      ? `${process.env.NEXT_PUBLIC_APP_URL}/orders/${existing.order.id}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/orders`;
    await sendEmail({
      to: existing.customer.email,
      toName: existing.customer.name,
      subject: `Your ${existing.product.name} design is ready to review`,
      html: designPreviewReadyEmail({
        name: existing.customer.name,
        orderNumber: existing.order?.orderNumber ?? existing.product.name,
        reviewUrl,
      }),
    });

    return NextResponse.json({ customizationRequest });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) return jsonError(error.message, 503);
    console.error("[admin/customizations/preview] upload failed:", error);
    return jsonError("Couldn't upload the preview. Please try again.", 500);
  }
}
