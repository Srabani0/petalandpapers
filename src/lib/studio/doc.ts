import { z } from "zod";

/**
 * The Design Studio document model — one JSON shape used everywhere:
 * admin templates (DesignTemplate.canvas), customer designs (Design.canvas),
 * the Konva editor, and server-side validation.
 *
 * Deliberately our own schema rather than Konva's toJSON(): it's small,
 * versioned, validated with zod on every save, and can't smuggle arbitrary
 * attributes or remote URLs into the database.
 *
 * Coordinates are in "design pixels" (the template's width × height). The
 * editor scales the stage to fit the screen; print export scales up.
 */

export const FONT_KEYS = [
  "playfair",
  "inter",
  "poppins",
  "montserrat",
  "dancing",
  "greatVibes",
  "pacifico",
  "caveat",
  "lobster",
  "bebas",
] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export const MAX_NODES = 150;
export const MAX_UPLOADS = 40;
export const MIN_SIZE = 4;

// Only images we host can appear in a design. Uploads go through our own
// endpoints to Cloudinary; app-bundled assets are site-relative paths.
const ASSET_URL = /^(https:\/\/res\.cloudinary\.com\/|\/)[^\s"'<>]*$/;
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const coord = z.number().finite().min(-20000).max(20000);
const dim = z.number().finite().min(MIN_SIZE).max(20000);
const color = z.string().regex(HEX, "Invalid colour");
const assetUrl = z.string().max(600).regex(ASSET_URL, "Images must be uploaded through the studio");

const base = {
  id: z.string().min(1).max(64),
  x: coord,
  y: coord,
  width: dim,
  height: dim,
  rotation: z.number().finite().min(-3600).max(3600),
  opacity: z.number().min(0).max(1),
  locked: z.boolean(),
  shadow: z.boolean(),
  name: z.string().max(60).optional(),
};

const imageNode = z.object({
  ...base,
  type: z.literal("image"),
  src: assetUrl,
  flipX: z.boolean(),
});

const photoNode = z.object({
  ...base,
  type: z.literal("photo"),
  src: assetUrl.nullable(),
  placeholder: z.string().max(40),
  cornerRadius: z.number().min(0).max(2000),
  stroke: color,
  strokeWidth: z.number().min(0).max(200),
  fill: color,
  padding: z.number().min(0).max(500),
  zoom: z.number().min(1).max(5),
  panX: z.number().min(-1).max(1),
  panY: z.number().min(-1).max(1),
});

const textNode = z.object({
  ...base,
  type: z.literal("text"),
  text: z.string().max(500),
  fontFamily: z.enum(FONT_KEYS),
  fontSize: z.number().min(4).max(800),
  fill: color,
  align: z.enum(["left", "center", "right"]),
  bold: z.boolean(),
  italic: z.boolean(),
  underline: z.boolean(),
  lineHeight: z.number().min(0.5).max(4),
  letterSpacing: z.number().min(-50).max(200),
  stroke: color,
  strokeWidth: z.number().min(0).max(50),
});

const shapeNode = z.object({
  ...base,
  type: z.enum(["rect", "ellipse"]),
  fill: color,
  stroke: color,
  strokeWidth: z.number().min(0).max(200),
  cornerRadius: z.number().min(0).max(2000),
});

export const designNodeSchema = z.discriminatedUnion("type", [imageNode, photoNode, textNode, shapeNode]);

export const designDocSchema = z.object({
  version: z.literal(1),
  width: z.number().int().min(100).max(10000),
  height: z.number().int().min(100).max(10000),
  background: z.object({
    color,
    imageUrl: assetUrl.nullable(),
    locked: z.boolean(),
  }),
  nodes: z.array(designNodeSchema).max(MAX_NODES),
  uploads: z.array(assetUrl).max(MAX_UPLOADS),
});

export type DesignDoc = z.infer<typeof designDocSchema>;
export type DesignNode = z.infer<typeof designNodeSchema>;
export type ImageNode = z.infer<typeof imageNode>;
export type PhotoNode = z.infer<typeof photoNode>;
export type TextNode = z.infer<typeof textNode>;
export type ShapeNode = z.infer<typeof shapeNode>;
export type NodeType = DesignNode["type"];

/** Parses untrusted JSON into a DesignDoc, or returns the first problem. */
export function parseDesignDoc(input: unknown): { doc: DesignDoc } | { error: string } {
  const result = designDocSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { error: `Invalid design: ${issue?.path.join(".") || "document"} — ${issue?.message ?? "invalid"}` };
  }
  const ids = new Set<string>();
  for (const node of result.data.nodes) {
    if (ids.has(node.id)) return { error: "Invalid design: duplicate element id" };
    ids.add(node.id);
  }
  return { doc: result.data };
}

// ─── Sizes ─────────────────────────────────────────────────────────────────

export const SIZE_PRESETS = [
  { key: "6x8", label: "Small · 6 × 8 in", width: 900, height: 1200 },
  { key: "8x10", label: "Medium · 8 × 10 in", width: 960, height: 1200 },
  { key: "10x12", label: "Large · 10 × 12 in", width: 1000, height: 1200 },
  { key: "12x16", label: "XL · 12 × 16 in", width: 1200, height: 1600 },
  { key: "square8", label: "Square · 8 × 8 in", width: 1200, height: 1200 },
  { key: "landscape", label: "Landscape · 10 × 8 in", width: 1200, height: 960 },
  { key: "card4x6", label: "Card · 4 × 6 in", width: 800, height: 1200 },
  { key: "card5x7", label: "Card · 5 × 7 in", width: 1000, height: 1400 },
  { key: "mug11", label: "Mug wrap · 11 oz", width: 2300, height: 950 },
  { key: "mug15", label: "Mug wrap · 15 oz", width: 2400, height: 1080 },
] as const;

// ─── Factories ─────────────────────────────────────────────────────────────

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

const baseDefaults = { rotation: 0, opacity: 1, locked: false, shadow: false };

export function emptyDoc(width: number, height: number): DesignDoc {
  return {
    version: 1,
    width,
    height,
    background: { color: "#ffffff", imageUrl: null, locked: false },
    nodes: [],
    uploads: [],
  };
}

export function makeText(doc: Pick<DesignDoc, "width" | "height">, over: Partial<TextNode> = {}): TextNode {
  const fontSize = over.fontSize ?? Math.round(Math.min(doc.width, doc.height) * 0.06);
  const width = over.width ?? Math.round(doc.width * 0.6);
  return {
    ...baseDefaults,
    id: uid(),
    type: "text",
    text: "Your text here",
    fontFamily: "playfair",
    fontSize,
    fill: "#1e2a4a",
    align: "center",
    bold: false,
    italic: false,
    underline: false,
    lineHeight: 1.2,
    letterSpacing: 0,
    stroke: "#000000",
    strokeWidth: 0,
    x: Math.round((doc.width - width) / 2),
    y: Math.round(doc.height / 2 - fontSize),
    width,
    height: Math.round(fontSize * 1.4),
    ...over,
  };
}

export function makePhoto(doc: Pick<DesignDoc, "width" | "height">, over: Partial<PhotoNode> = {}): PhotoNode {
  const size = Math.round(Math.min(doc.width, doc.height) * 0.32);
  const width = over.width ?? size;
  const height = over.height ?? Math.round(size * 1.25);
  return {
    ...baseDefaults,
    id: uid(),
    type: "photo",
    src: null,
    placeholder: "Add photo",
    cornerRadius: 0,
    stroke: "#111111",
    strokeWidth: Math.max(2, Math.round(size * 0.02)),
    fill: "#ffffff",
    padding: Math.round(size * 0.04),
    zoom: 1,
    panX: 0,
    panY: 0,
    x: Math.round((doc.width - width) / 2),
    y: Math.round((doc.height - height) / 2),
    width,
    height,
    ...over,
  };
}

export function makeShape(
  doc: Pick<DesignDoc, "width" | "height">,
  type: "rect" | "ellipse",
  over: Partial<ShapeNode> = {},
): ShapeNode {
  const size = Math.round(Math.min(doc.width, doc.height) * 0.25);
  const width = over.width ?? size;
  const height = over.height ?? size;
  return {
    ...baseDefaults,
    id: uid(),
    type,
    fill: "#c79a5d",
    stroke: "#000000",
    strokeWidth: 0,
    cornerRadius: 0,
    x: Math.round((doc.width - width) / 2),
    y: Math.round((doc.height - height) / 2),
    width,
    height,
    ...over,
  };
}

export function makeImage(
  doc: Pick<DesignDoc, "width" | "height">,
  src: string,
  natural: { width: number; height: number },
  over: Partial<ImageNode> = {},
): ImageNode {
  const max = Math.min(doc.width, doc.height) * 0.3;
  const scale = Math.min(1, max / Math.max(natural.width, natural.height, 1));
  const width = Math.max(MIN_SIZE, Math.round(natural.width * scale));
  const height = Math.max(MIN_SIZE, Math.round(natural.height * scale));
  return {
    ...baseDefaults,
    id: uid(),
    type: "image",
    src,
    flipX: false,
    x: Math.round((doc.width - width) / 2),
    y: Math.round((doc.height - height) / 2),
    width,
    height,
    ...over,
  };
}

/** Duplicates a node with a fresh id, nudged so the copy is visible. */
export function cloneNode<T extends DesignNode>(node: T, offset = 24): T {
  return { ...node, id: uid(), x: node.x + offset, y: node.y + offset, locked: false };
}

/** Customer copy of a template: same content, uploads tray emptied. */
export function docForCustomer(template: DesignDoc): DesignDoc {
  return { ...template, uploads: [] };
}

/** Every image URL a doc references (for preloading before export). */
export function docImageUrls(doc: DesignDoc): string[] {
  const urls = new Set<string>();
  if (doc.background.imageUrl) urls.add(doc.background.imageUrl);
  for (const node of doc.nodes) {
    if (node.type === "image") urls.add(node.src);
    if (node.type === "photo" && node.src) urls.add(node.src);
  }
  return [...urls];
}

/** Number of photo frames still waiting for a picture. */
export function emptyPhotoSlots(doc: DesignDoc) {
  return doc.nodes.filter((n) => n.type === "photo" && !n.src).length;
}

// ─── Product kinds (drive the 3D preview model) ───────────────────────────

export const STUDIO_KINDS = ["MINIATURE", "MUG", "FRAME", "CARD", "STANDARD"] as const;
export type StudioKind = (typeof STUDIO_KINDS)[number];

export const STUDIO_KIND_LABEL: Record<StudioKind, string> = {
  MINIATURE: "3D miniature — board on an easel with real shelves",
  MUG: "Mug — design wraps around a ceramic mug",
  FRAME: "Photo frame — print behind glass in a wooden frame",
  CARD: "Card — standing card / bouquet message card",
  STANDARD: "Flat board — generic standing print",
};

/**
 * Wide, thin rectangles (or anything named "Shelf…") are shelves: the 3D
 * preview extrudes them into real ledges that stick out of the board.
 */
export function detectShelves(doc: DesignDoc) {
  return doc.nodes
    .filter(
      (n): n is ShapeNode =>
        n.type === "rect" &&
        Math.abs(n.rotation) < 1 &&
        (/shelf/i.test(n.name ?? "") || (n.width >= doc.width * 0.45 && n.height <= doc.height * 0.04)),
    )
    .map((n) => ({
      x: n.x / doc.width,
      y: n.y / doc.height,
      width: n.width / doc.width,
      height: n.height / doc.height,
      color: n.fill,
    }));
}
