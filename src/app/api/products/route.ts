import { NextResponse } from "next/server";
import { listProducts } from "@/lib/products";
import { productListQuerySchema } from "@/lib/validations/product";
import { zodError } from "@/lib/api-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = productListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return zodError(parsed.error);

  const result = await listProducts(parsed.data);
  return NextResponse.json(result);
}
