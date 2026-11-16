import type { EditorApi } from "@/components/studio/editor/DesignEditor";

// Vercel caps a request body at ~4.5MB; preview + print travel together.
const PRINT_BUDGET = 3.6 * 1024 * 1024;
const PRINT_ATTEMPTS = [
  { maxSide: 3000, quality: 0.92 },
  { maxSide: 3000, quality: 0.84 },
  { maxSide: 2600, quality: 0.8 },
  { maxSide: 2200, quality: 0.78 },
  { maxSide: 1800, quality: 0.75 },
];

/** Renders print + preview images for the current canvas, keeping the upload within budget. */
export async function renderDesignFiles(api: EditorApi) {
  let print: Blob | null = null;
  for (const attempt of PRINT_ATTEMPTS) {
    print = await api.exportBlob({ ...attempt, mimeType: "image/jpeg" });
    if (print.size <= PRINT_BUDGET) break;
  }
  if (!print || print.size > PRINT_BUDGET) throw new Error("This design is too detailed to save. Try removing a few large photos.");

  const preview = await api.exportBlob({ maxSide: 900, mimeType: "image/jpeg", quality: 0.85 });
  return {
    print: new File([print], "print.jpg", { type: "image/jpeg" }),
    preview: new File([preview], "preview.jpg", { type: "image/jpeg" }),
  };
}

export function describeExportError(err: unknown) {
  if (err instanceof DOMException && err.name === "SecurityError") {
    return "One of the images couldn't be included in the export. Please re-upload it and try again.";
  }
  return err instanceof Error ? err.message : "Something went wrong while saving.";
}
