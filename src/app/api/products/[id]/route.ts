import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { jsonError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return jsonError("Product not found.", 404);
  return NextResponse.json({ product });
}
