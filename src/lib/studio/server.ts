import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getOrCreateCart, MAX_DESIGN_QUANTITY } from "@/lib/cart";
import { docForCustomer, parseDesignDoc, type DesignDoc } from "@/lib/studio/doc";

/** Hard cap on a single rendered file (Vercel's request body limit is ~4.5MB for both). */
export const MAX_RENDER_BYTES = 4 * 1024 * 1024;
const RENDER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isAcceptableRender(file: unknown): file is File {
  return (
    file instanceof File && RENDER_TYPES.includes(file.type) && file.size > 0 && file.size <= MAX_RENDER_BYTES
  );
}

// ─── Public catalogue ──────────────────────────────────────────────────────

export async function listStudioCategories() {
  const categories = await prisma.designCategory.findMany({
    where: { isActive: true, product: { status: { not: "ARCHIVED" } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      templates: {
        where: { isActive: true },
        select: { price: true, thumbnailUrl: true, canvas: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return categories
    .filter((c) => c.templates.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      kind: c.kind,
      coverImageUrl: c.coverImageUrl ?? c.templates.find((t) => t.thumbnailUrl)?.thumbnailUrl ?? null,
      // Live-rendered cover when no image has been uploaded yet.
      coverCanvas: c.templates[0]?.canvas ?? null,
      templateCount: c.templates.length,
      startingPrice: Math.min(...c.templates.map((t) => Number(t.price))),
    }));
}

export async function getStudioCategory(slug: string) {
  return prisma.designCategory.findFirst({
    where: { slug, isActive: true, product: { status: { not: "ARCHIVED" } } },
    include: {
      product: { select: { deliveryTime: true } },
      templates: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          sizeLabel: true,
          width: true,
          height: true,
          price: true,
          thumbnailUrl: true,
          canvas: true,
        },
      },
    },
  });
}

export async function getCategoryElements(categoryId: string) {
  return prisma.designElement.findMany({
    where: { categoryId },
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, group: true, imageUrl: true },
  });
}

// ─── Customer designs ──────────────────────────────────────────────────────

const designInclude = {
  template: {
    select: {
      id: true,
      name: true,
      sizeLabel: true,
      width: true,
      height: true,
      price: true,
      category: {
        select: { id: true, name: true, slug: true, kind: true, product: { select: { deliveryTime: true } } },
      },
    },
  },
  cartItems: { select: { id: true } },
} satisfies Prisma.DesignInclude;

export type DesignWithTemplate = Prisma.DesignGetPayload<{ include: typeof designInclude }>;

export async function getOwnDesign(userId: string, designId: string) {
  const design = await prisma.design.findUnique({ where: { id: designId }, include: designInclude });
  if (!design || design.customerId !== userId) return null;
  return design;
}

export async function listOwnDesigns(userId: string) {
  return prisma.design.findMany({
    where: { customerId: userId },
    orderBy: { updatedAt: "desc" },
    include: designInclude,
  });
}

export async function createDesignFromTemplate(
  userId: string,
  templateId: string,
): Promise<{ error: string } | { id: string }> {
  const template = await prisma.designTemplate.findFirst({
    where: { id: templateId, isActive: true, category: { isActive: true } },
  });
  if (!template) return { error: "This template isn't available any more." };

  const parsed = parseDesignDoc(template.canvas);
  if ("error" in parsed) return { error: "This template is still being set up. Please try another." };

  const design = await prisma.design.create({
    data: {
      customerId: userId,
      templateId,
      canvas: docForCustomer(parsed.doc) as unknown as Prisma.InputJsonValue,
    },
  });
  return { id: design.id };
}

/** "Make a copy" — used to keep editing a design that's already been ordered. */
export async function duplicateDesign(
  userId: string,
  designId: string,
): Promise<{ error: string } | { id: string }> {
  const source = await prisma.design.findUnique({ where: { id: designId } });
  if (!source || source.customerId !== userId) return { error: "Design not found." };

  const copy = await prisma.design.create({
    data: {
      customerId: userId,
      templateId: source.templateId,
      canvas: source.canvas as Prisma.InputJsonValue,
    },
  });
  return { id: copy.id };
}

/**
 * Saves the canvas together with freshly rendered preview + print images, so
 * the print file always matches what the customer last saw. Old renders are
 * removed from Cloudinary — safe because a DRAFT design is never referenced
 * by an order (designs lock to ORDERED the moment an order is created).
 */
export async function saveDesign(
  userId: string,
  designId: string,
  input: { canvas: unknown; preview: File; print: File },
): Promise<{ error: string; status?: number } | { design: DesignWithTemplate }> {
  const design = await prisma.design.findUnique({
    where: { id: designId },
    include: { template: { select: { width: true, height: true } } },
  });
  if (!design || design.customerId !== userId) return { error: "Design not found.", status: 404 };
  if (design.status === "ORDERED") {
    return { error: "This design has already been ordered. Make a copy to keep editing.", status: 409 };
  }

  const parsed = parseDesignDoc(input.canvas);
  if ("error" in parsed) return { error: parsed.error, status: 400 };
  if (parsed.doc.width !== design.template.width || parsed.doc.height !== design.template.height) {
    return { error: "Design size doesn't match its template.", status: 400 };
  }

  const [preview, print] = await Promise.all([
    uploadImage(Buffer.from(await input.preview.arrayBuffer()), "designs/previews"),
    uploadImage(Buffer.from(await input.print.arrayBuffer()), "designs/print"),
  ]);

  const updated = await prisma.design.update({
    where: { id: designId },
    data: {
      canvas: parsed.doc as unknown as Prisma.InputJsonValue,
      previewUrl: preview.url,
      previewPublicId: preview.publicId,
      printUrl: print.url,
      printPublicId: print.publicId,
    },
    include: designInclude,
  });

  for (const oldId of [design.previewPublicId, design.printPublicId]) {
    if (oldId) deleteImage(oldId).catch((err) => console.warn("[studio] couldn't delete old render", err));
  }

  return { design: updated };
}

export async function deleteDesign(
  userId: string,
  designId: string,
): Promise<{ error: string; status?: number } | { ok: true }> {
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design || design.customerId !== userId) return { error: "Design not found.", status: 404 };
  if (design.status === "ORDERED") {
    return { error: "Ordered designs are kept with your order and can't be deleted.", status: 409 };
  }
  await prisma.design.delete({ where: { id: designId } }); // cart items cascade
  for (const id of [design.previewPublicId, design.printPublicId]) {
    if (id) deleteImage(id).catch(() => undefined);
  }
  return { ok: true };
}

/** Adds a saved design to the cart at its template's price (server-side price, never the client's). */
export async function addDesignToCart(
  userId: string,
  designId: string,
  quantity: number,
): Promise<{ error: string } | { ok: true }> {
  const design = await prisma.design.findUnique({
    where: { id: designId },
    include: { template: { include: { category: { include: { product: true } } } } },
  });
  if (!design || design.customerId !== userId) return { error: "Design not found." };
  if (design.status === "ORDERED") return { error: "This design has already been ordered. Make a copy to order it again." };
  if (!design.printUrl || !design.previewUrl) return { error: "Please save your design before adding it to the cart." };

  const { template } = design;
  if (!template.isActive || !template.category.isActive || template.category.product.status === "ARCHIVED") {
    return { error: "This template isn't available any more." };
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.designId === designId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: Math.min(existing.quantity + quantity, MAX_DESIGN_QUANTITY),
        unitPrice: template.price,
      },
    });
    return { ok: true as const };
  }

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: template.category.productId,
      quantity: Math.min(quantity, MAX_DESIGN_QUANTITY),
      unitPrice: template.price,
      designId,
    },
  });
  return { ok: true as const };
}

export type { DesignDoc };
