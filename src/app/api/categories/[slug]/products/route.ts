import { NextResponse } from "next/server";
import { getCategoryBySlug, listProducts } from "@/lib/products";
import { productListQuerySchema } from "@/lib/validations/product";
import { jsonError, zodError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.isActive) return jsonError("Category not found.", 404);

  const { searchParams } = new URL(request.url);
  const parsed = productListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return zodError(parsed.error);

  const result = await listProducts({ ...parsed.data, category: slug });
  return NextResponse.json({ category, ...result });
}
