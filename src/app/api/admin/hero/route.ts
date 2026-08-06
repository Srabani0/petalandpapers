import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { heroContentSchema } from "@/lib/validations/hero";
import { updateHeroContent } from "@/lib/hero";
import { jsonError, zodError } from "@/lib/api-response";

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const body = await request.json().catch(() => null);
  const parsed = heroContentSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const content = await updateHeroContent(parsed.data);
  return NextResponse.json({ content });
}
