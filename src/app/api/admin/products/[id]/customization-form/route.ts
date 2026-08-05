import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { customizationFormSchema } from "@/lib/validations/customization";
import { jsonError, zodError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const form = await prisma.customizationForm.findUnique({
    where: { productId: id },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ form });
}

export async function POST(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return jsonError("Product not found.", 404);

  const body = await request.json().catch(() => null);
  const parsed = customizationFormSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { title, description, fields } = parsed.data;

  for (const field of fields) {
    if (field.fieldType === "DROPDOWN" && field.options.length === 0) {
      return jsonError(`"${field.label}" is a dropdown but has no options.`, 400);
    }
  }

  const form = await prisma.$transaction(async (tx) => {
    const savedForm = await tx.customizationForm.upsert({
      where: { productId: id },
      update: { title, description: description || null },
      create: { productId: id, title, description: description || null },
    });

    await tx.customizationField.deleteMany({ where: { formId: savedForm.id } });

    await tx.customizationField.createMany({
      data: fields.map((field, index) => ({
        formId: savedForm.id,
        label: field.label,
        fieldType: field.fieldType,
        placeholder: field.placeholder || null,
        isRequired: field.isRequired ?? true,
        options: field.fieldType === "DROPDOWN" ? field.options : undefined,
        minValue: field.minValue || null,
        maxValue: field.maxValue || null,
        sortOrder: index,
      })),
    });

    return tx.customizationForm.findUniqueOrThrow({
      where: { id: savedForm.id },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    });
  });

  return NextResponse.json({ form });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);
  const { id } = await params;

  const form = await prisma.customizationForm.findUnique({ where: { productId: id } });
  if (!form) return jsonError("This product has no customization form.", 404);

  await prisma.customizationForm.delete({ where: { id: form.id } });
  return NextResponse.json({ ok: true });
}
