import { studioTemplateMetaSchema, type StudioTemplateMeta } from "@/lib/validations/studio";
import { parseDesignDoc, type DesignDoc } from "@/lib/studio/doc";
import { isAcceptableRender } from "@/lib/studio/server";

/**
 * Parses the multipart body the admin template editor sends:
 * `meta` (JSON), `canvas` (JSON) and an optional `thumbnail` image.
 */
export async function readTemplateForm(
  request: Request,
): Promise<{ error: string } | { meta: StudioTemplateMeta; doc: DesignDoc; thumbnail: File | null }> {
  const form = await request.formData().catch(() => null);
  if (!form) return { error: "Invalid form submission." };

  let metaJson: unknown;
  let canvasJson: unknown;
  try {
    metaJson = JSON.parse(String(form.get("meta") ?? ""));
    canvasJson = JSON.parse(String(form.get("canvas") ?? ""));
  } catch {
    return { error: "Invalid template payload." };
  }

  const meta = studioTemplateMetaSchema.safeParse(metaJson);
  if (!meta.success) return { error: meta.error.issues[0]?.message ?? "Invalid template details." };

  const parsed = parseDesignDoc(canvasJson);
  if ("error" in parsed) return { error: parsed.error };
  if (parsed.doc.width !== meta.data.width || parsed.doc.height !== meta.data.height) {
    return { error: "Canvas size doesn't match the template size." };
  }

  const thumb = form.get("thumbnail");
  if (thumb !== null && !isAcceptableRender(thumb)) return { error: "Invalid thumbnail image." };

  return { meta: meta.data, doc: parsed.doc, thumbnail: thumb };
}
