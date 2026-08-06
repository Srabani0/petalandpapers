import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { founderStorySchema } from "@/lib/validations/founder-story";
import { updateFounderStory } from "@/lib/founder-story";
import { jsonError, zodError } from "@/lib/api-response";

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const body = await request.json().catch(() => null);
  const parsed = founderStorySchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const story = await updateFounderStory({
    photoUrl: parsed.data.photoUrl || null,
    heading: parsed.data.heading,
    message: parsed.data.message,
    founderName: parsed.data.founderName,
  });
  return NextResponse.json({ story });
}
