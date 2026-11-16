import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { jsonError, zodError } from "@/lib/api-response";
import { RESERVED_STUDIO_SLUGS, studioCategorySchema } from "@/lib/validations/studio";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const parsed = studioCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return jsonError("Linked product not found.", 400);

  const slug = data.slug || slugify(data.name);
  if (!slug) return jsonError("Couldn't make a URL slug from that name — enter one.", 400);
  if (RESERVED_STUDIO_SLUGS.includes(slug)) return jsonError("That URL is reserved — enter a different slug.", 400);

  try {
    const category = await prisma.designCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        coverImageUrl: data.coverImageUrl || null,
        kind: data.kind,
        productId: data.productId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return jsonError("A studio category with this URL slug already exists.", 409);
    }
    throw err;
  }
}
