import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { jsonError, zodError } from "@/lib/api-response";
import { createDesignSchema } from "@/lib/validations/studio";
import { createDesignFromTemplate, duplicateDesign } from "@/lib/studio/server";
import { checkRateLimit } from "@/lib/rate-limit";

/** Starts a new design from a template, or copies an existing design. */
export async function POST(request: Request) {
  const session = await requireUser(request);
  if (!session) return jsonError("Please sign in to start designing.", 401);

  const rate = checkRateLimit(`studio-design:${session.sub}`, { max: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) return jsonError("Too many new designs — please wait a few minutes.", 429);

  const parsed = createDesignSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const result =
    "templateId" in parsed.data
      ? await createDesignFromTemplate(session.sub, parsed.data.templateId)
      : await duplicateDesign(session.sub, parsed.data.fromDesignId);
  if ("error" in result) return jsonError(result.error, 404);

  return NextResponse.json({ id: result.id }, { status: 201 });
}
