import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { uploadImage, isAllowedImage, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import {
  validateCustomizationFormData,
  type CustomizationFieldLike,
  type CustomizationFormData,
} from "@/lib/customization";
import { jsonError } from "@/lib/api-response";

const MAX_REFERENCE_DESIGNS = 5;

async function uploadAll(files: File[], folder: string) {
  const results: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadImage(buffer, folder);
    results.push(url);
  }
  return results;
}

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Unauthorized", 401);

  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError("Invalid form submission.", 400);

  const productId = formData.get("productId");
  if (typeof productId !== "string" || !productId) {
    return jsonError("Missing productId.", 400);
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, status: { not: "ARCHIVED" } },
  });
  if (!product) return jsonError("Product not found.", 404);
  if (!product.isCustomizable) return jsonError("This product isn't customizable.", 400);

  const form = await prisma.customizationForm.findUnique({
    where: { productId },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!form || form.fields.length === 0) {
    return jsonError("This product's customization form isn't set up yet.", 400);
  }

  let rawFormData: CustomizationFormData;
  try {
    rawFormData = JSON.parse(String(formData.get("formData") ?? "{}")) as CustomizationFormData;
  } catch {
    return jsonError("Invalid formData payload.", 400);
  }

  const fieldsForValidation: CustomizationFieldLike[] = form.fields.map((field) => ({
    id: field.id,
    label: field.label,
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    options: Array.isArray(field.options) ? (field.options as string[]) : null,
    minValue: field.minValue,
    maxValue: field.maxValue,
  }));

  const customerNotes = formData.get("customerNotes");
  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const referenceDesigns = formData
    .getAll("referenceDesigns")
    .filter((f): f is File => f instanceof File);

  const minPhotos = product.minPhotos ?? 0;
  const maxPhotos = product.maxPhotos ?? 10;
  if (photos.length < minPhotos) {
    return jsonError(`Please upload at least ${minPhotos} photo(s).`, 400);
  }
  if (photos.length > maxPhotos) {
    return jsonError(`Please upload at most ${maxPhotos} photo(s).`, 400);
  }
  if (referenceDesigns.length > MAX_REFERENCE_DESIGNS) {
    return jsonError(`Please upload at most ${MAX_REFERENCE_DESIGNS} reference design(s).`, 400);
  }
  for (const file of [...photos, ...referenceDesigns]) {
    if (!isAllowedImage(file)) {
      return jsonError(
        `"${file.name}" isn't a supported image, or is over 10 MB.`,
        400,
      );
    }
  }

  // Per-field file uploads (IMAGE_UPLOAD / FILE_UPLOAD field types) come in
  // as `field_<fieldId>` and get folded into formData as their resulting URL.
  const fieldFiles = new Map<string, File>();
  for (const field of form.fields) {
    if (field.fieldType !== "IMAGE_UPLOAD" && field.fieldType !== "FILE_UPLOAD") continue;
    const file = formData.get(`field_${field.id}`);
    if (file instanceof File && file.size > 0) {
      if (!isAllowedImage(file)) {
        return jsonError(`"${field.label}" upload isn't a supported image, or is over 10 MB.`, 400);
      }
      fieldFiles.set(field.id, file);
    }
  }

  try {
    const uploadedFieldUrls = new Map<string, string>();
    for (const [fieldId, file] of fieldFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await uploadImage(buffer, "customizations");
      uploadedFieldUrls.set(fieldId, url);
    }

    const mergedFormData: CustomizationFormData = { ...rawFormData };
    for (const [fieldId, url] of uploadedFieldUrls) {
      mergedFormData[fieldId] = url;
    }

    const { valid, errors } = validateCustomizationFormData(fieldsForValidation, mergedFormData);
    if (!valid) {
      return NextResponse.json({ error: "Please check the highlighted fields.", errors }, { status: 400 });
    }

    const [uploadedPhotos, referenceDesignUrls] = await Promise.all([
      uploadAll(photos, "customizations"),
      uploadAll(referenceDesigns, "references"),
    ]);

    const request_ = await prisma.customizationRequest.create({
      data: {
        customerId: session.sub,
        productId,
        formData: mergedFormData,
        uploadedPhotos,
        referenceDesigns: referenceDesignUrls,
        customerNotes: typeof customerNotes === "string" && customerNotes ? customerNotes : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ customizationRequest: request_ }, { status: 201 });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return jsonError(error.message, 503);
    }
    console.error("[customizations] submission failed:", error);
    return jsonError("Couldn't save your customization. Please try again.", 500);
  }
}
