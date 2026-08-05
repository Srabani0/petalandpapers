import { NextResponse } from "next/server";
import { listCategories } from "@/lib/products";

export async function GET() {
  const categories = await listCategories({ activeOnly: true });
  return NextResponse.json({ categories });
}
