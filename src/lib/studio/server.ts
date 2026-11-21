import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getOrCreateCart, MAX_DESIGN_QUANTITY } from "@/lib/cart";
import { docForCustomer, parseDesignDoc, type BouquetRecipe, type DesignDoc } from "@/lib/studio/doc";
import { BOUQUET_CATEGORY_SLUG, buildBouquetDoc, priceRecipe } from "@/lib/studio/bouquet";

/**
 * What a design costs: its template's price, or — for Bouquet Builder
 * designs — the price of the recipe it carries (always computed here).
 */
export function designPrice(templatePrice: { toString(): string }, canvas: unknown): number {
  const parsed = parseDesignDoc(canvas);
  const recipe = "doc" in parsed ? parsed.doc.meta?.bouquet : undefined;
  if (recipe) {
    const priced = priceRecipe(recipe);
    if ("total" in priced) return priced.total;
  }
  return Number(templatePrice);
}

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

  if (parsed.doc.meta?.bouquet) {
    await prisma.cartItem.updateMany({
      where: { designId },
      data: { unitPrice: designPrice(updated.template.price, parsed.doc) },
    });
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

  const unitPrice = designPrice(template.price, design.canvas);
  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.designId === designId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: Math.min(existing.quantity + quantity, MAX_DESIGN_QUANTITY),
        unitPrice,
      },
    });
    return { ok: true as const };
  }

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: template.category.productId,
      quantity: Math.min(quantity, MAX_DESIGN_QUANTITY),
      unitPrice,
      designId,
    },
  });
  return { ok: true as const };
}

export type { DesignDoc };

// ─── Bouquet Builder ───────────────────────────────────────────────────────

export async function getBouquetTemplate() {
  return prisma.designTemplate.findFirst({
    where: { isActive: true, category: { slug: BOUQUET_CATEGORY_SLUG, isActive: true } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, width: true, height: true },
  });
}

/**
 * Creates (or updates) a customer's bouquet design from a recipe. The picture
 * is always rebuilt here from the recipe, so it can't drift from what's paid for.
 */
export async function saveBouquet(
  userId: string,
  recipe: BouquetRecipe,
  designId?: string,
): Promise<{ error: string; status?: number } | { id: string }> {
  const priced = priceRecipe(recipe);
  if ("error" in priced) return { error: priced.error, status: 400 };
  const template = await getBouquetTemplate();
  if (!template) return { error: "The bouquet builder is being set up. Please try again soon.", status: 503 };

  const doc = buildBouquetDoc(recipe);
  if (doc.width !== template.width || doc.height !== template.height) {
    return { error: "The bouquet builder is being set up. Please try again soon.", status: 503 };
  }
  const canvas = doc as unknown as Prisma.InputJsonValue;

  if (designId) {
    const design = await prisma.design.findUnique({ where: { id: designId } });
    if (design && design.customerId === userId && design.status === "DRAFT" && design.templateId === template.id) {
      // The old renders no longer match — the editor re-renders on the next save.
      await prisma.design.update({
        where: { id: designId },
        data: { canvas, previewUrl: null, previewPublicId: null, printUrl: null, printPublicId: null },
      });
      await prisma.cartItem.updateMany({ where: { designId }, data: { unitPrice: priced.total } });
      for (const id of [design.previewPublicId, design.printPublicId]) {
        if (id) deleteImage(id).catch(() => undefined);
      }
      return { id: designId };
    }
  }

  const created = await prisma.design.create({ data: { customerId: userId, templateId: template.id, canvas } });
  return { id: created.id };
}
