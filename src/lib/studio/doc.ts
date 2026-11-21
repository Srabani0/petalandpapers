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
  /** Locked, but customers may still slide it up/down (e.g. shelves). */
  slideY: z.boolean().optional(),
  name: z.string().max(60).optional(),
};

const imageNode = z.object({
  ...base,
  type: z.literal("image"),
  src: assetUrl,
  flipX: z.boolean(),
});

/** Photo frame shapes (rect uses cornerRadius). */
export const PHOTO_MASKS = ["rect", "circle", "heart", "star", "arch", "hexagon"] as const;
export type PhotoMask = (typeof PHOTO_MASKS)[number];

const photoNode = z.object({
  ...base,
  type: z.literal("photo"),
  mask: z.enum(PHOTO_MASKS).optional(),
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
  /** -100…100: bends the text into an arc (positive = arch, negative = smile). */
  curve: z.number().min(-100).max(100).optional(),
});

const shapeNode = z.object({
  ...base,
  type: z.enum(["rect", "ellipse"]),
  fill: color,
  stroke: color,
  strokeWidth: z.number().min(0).max(200),
  cornerRadius: z.number().min(0).max(2000),
});

/** Local date-time as typed by the customer, e.g. "2024-02-14T21:30". */
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid date");

const qrNode = z.object({
  ...base,
  type: z.literal("qr"),
  data: z.string().min(1).max(500),
  fg: color,
  bg: color,
});

/** The real night sky over a place at a moment (stars + constellations). */
const starMapNode = z.object({
  ...base,
  type: z.literal("starmap"),
  date: localDateTime,
  /** Minutes east of UTC for the date above (IST = 330). */
  utcOffset: z.number().int().min(-720).max(840),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  place: z.string().max(80),
  sky: color,
  starColor: color,
  lines: z.boolean(),
  grid: z.boolean(),
});

/** The moon's phase on a date. */
const moonNode = z.object({
  ...base,
  type: z.literal("moon"),
  date: localDateTime,
  lit: color,
  dark: color,
});

export const designNodeSchema = z.discriminatedUnion("type", [imageNode, photoNode, textNode, shapeNode, qrNode, starMapNode, moonNode]);

/** Bouquet Builder recipe — what the workshop makes; the price is computed from it on the server. */
export const bouquetRecipeSchema = z.object({
  size: z.enum(["mini", "classic", "grand"]),
  flowers: z.array(z.object({ id: z.string().min(1).max(40), count: z.number().int().min(1).max(30) })).max(20),
  wrap: z.string().min(1).max(20),
  ribbon: z.string().min(1).max(20),
  fillers: z.array(z.string().min(1).max(20)).max(6),
  message: z.string().max(120),
  from: z.string().max(40),
});
export type BouquetRecipe = z.infer<typeof bouquetRecipeSchema>;

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
  meta: z.object({ bouquet: bouquetRecipeSchema.optional() }).optional(),
});

export type DesignDoc = z.infer<typeof designDocSchema>;
export type DesignNode = z.infer<typeof designNodeSchema>;
export type ImageNode = z.infer<typeof imageNode>;
export type PhotoNode = z.infer<typeof photoNode>;
export type TextNode = z.infer<typeof textNode>;
export type ShapeNode = z.infer<typeof shapeNode>;
export type QrNode = z.infer<typeof qrNode>;
export type StarMapNode = z.infer<typeof starMapNode>;
export type MoonNode = z.infer<typeof moonNode>;
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

const square = (doc: Pick<DesignDoc, "width" | "height">, f: number) => Math.round(Math.min(doc.width, doc.height) * f);
const centred = (doc: Pick<DesignDoc, "width" | "height">, w: number, h: number) => ({
  x: Math.round((doc.width - w) / 2),
  y: Math.round((doc.height - h) / 2),
  width: w,
  height: h,
});

/** "2024-02-14T21:30" for now in the given UTC offset. */
export function localNow(utcOffset = 330) {
  return new Date(Date.now() + utcOffset * 60000).toISOString().slice(0, 16);
}

export function makeQr(doc: Pick<DesignDoc, "width" | "height">, over: Partial<QrNode> = {}): QrNode {
  const size = square(doc, 0.24);
  return { ...baseDefaults, id: uid(), type: "qr", data: "https://www.petalandpapers.com", fg: "#1e2a4a", bg: "#ffffff", ...centred(doc, size, size), ...over };
}

export function makeStarMap(doc: Pick<DesignDoc, "width" | "height">, over: Partial<StarMapNode> = {}): StarMapNode {
  const size = square(doc, 0.6);
  return {
    ...baseDefaults,
    id: uid(),
    type: "starmap",
    date: localNow(330),
    utcOffset: 330,
    lat: 28.6139,
    lon: 77.209,
    place: "New Delhi, India",
    sky: "#141c38",
    starColor: "#ffffff",
    lines: true,
    grid: false,
    ...centred(doc, size, size),
    ...over,
  };
}

export function makeMoon(doc: Pick<DesignDoc, "width" | "height">, over: Partial<MoonNode> = {}): MoonNode {
  const size = square(doc, 0.3);
  return { ...baseDefaults, id: uid(), type: "moon", date: localNow(330), lit: "#f4ecd8", dark: "#1f2747", ...centred(doc, size, size), ...over };
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
function isShelfNode(doc: DesignDoc, n: DesignNode): n is ShapeNode {
  return (
    n.type === "rect" &&
    Math.abs(n.rotation) < 1 &&
    (/shelf/i.test(n.name ?? "") || (n.width >= doc.width * 0.45 && n.height <= doc.height * 0.04))
  );
}

export function detectShelves(doc: DesignDoc) {
  return doc.nodes
    .filter((n): n is ShapeNode => isShelfNode(doc, n))
    .map((n) => ({
      x: n.x / doc.width,
      y: n.y / doc.height,
      width: n.width / doc.width,
      height: n.height / doc.height,
      color: n.fill,
    }));
}

/** A set of elements that physically stand on a shelf (or on another standing item). */
export interface StandingGroup {
  /** Base element first, then anything drawn on top of it (e.g. the name on a name plate). */
  ids: string[];
  /** Index into detectShelves(doc). */
  shelfIndex: number;
  /** 0 = stands on the shelf, 1 = stands on top of another standing item. */
  level: 0 | 1;
  /** Design-pixel y of the surface it stands on (shelf top, or the top of the item below). */
  supportTop: number;
  /** Rectangular objects (photo frames, plates) get real thickness in 3D. */
  solid: boolean;
  /** Colour for the edges of solid objects. */
  edge: string;
}

/** Approximate rendered height of a text box (stored height isn't kept in sync with wrapping). */
function nodeHeight(n: DesignNode) {
  if (n.type !== "text") return n.height;
  const lines = Math.max(1, n.text.split("\n").length);
  return Math.max(n.height, n.fontSize * n.lineHeight * lines);
}

/**
 * Works out which elements of a 3D-miniature design are *standing* — resting
 * on a shelf, or stacked on something that is — versus stuck flat on the
 * wall. The 3D preview cuts standing groups out and stands them up on the
 * shelves; everything else stays printed on the board.
 */
export function analyzeShelfScene(doc: DesignDoc): StandingGroup[] {
  const shelves = doc.nodes.filter((n): n is ShapeNode => isShelfNode(doc, n));
  if (shelves.length === 0) return [];
  // Items are placed by eye — be forgiving about a small gap or overlap.
  const tol = Math.max(8, doc.height * 0.018);
  const order = new Map(doc.nodes.map((n, i) => [n.id, i]));
  const overlapX = (a: DesignNode, b: { x: number; width: number }) =>
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);

  // Things that can stand: not text, not the shelves, roughly upright, not
  // wall-sized panels.
  const candidates = doc.nodes.filter(
    (n) =>
      n.type !== "text" &&
      !isShelfNode(doc, n) &&
      Math.abs(n.rotation) < 4 &&
      n.height < doc.height * 0.6 &&
      n.width < doc.width * 0.9,
  );

  const groups: StandingGroup[] = [];
  const used = new Set<string>();
  const solidOf = (n: DesignNode) => n.type === "photo" || n.type === "rect";
  const edgeOf = (n: DesignNode) =>
    n.type === "photo" ? (n.strokeWidth > 0 ? n.stroke : n.fill) : n.type === "rect" ? (n.strokeWidth > 0 ? n.stroke : n.fill) : "#ffffff";

  // Level 0: bottom edge touches a shelf.
  for (const n of candidates) {
    const bottom = n.y + n.height;
    const shelfIndex = shelves.findIndex(
      (sh) => overlapX(n, sh) > Math.min(n.width, sh.width) * 0.3 && bottom >= sh.y - tol && bottom <= sh.y + sh.height + tol / 2,
    );
    if (shelfIndex === -1) continue;
    groups.push({ ids: [n.id], shelfIndex, level: 0, supportTop: shelves[shelfIndex].y, solid: solidOf(n), edge: edgeOf(n) });
    used.add(n.id);
  }

  // Level 1: resting on top of a level-0 item (e.g. a smiley on a stack of books).
  const bases = groups.map((g) => ({ g, node: doc.nodes.find((n) => n.id === g.ids[0])! }));
  for (const n of candidates) {
    if (used.has(n.id)) continue;
    const bottom = n.y + n.height;
    const below = bases.find(
      ({ node }) => overlapX(n, node) > Math.min(n.width, node.width) * 0.3 && Math.abs(bottom - node.y) <= tol,
    );
    if (!below) continue;
    groups.push({
      ids: [n.id],
      shelfIndex: below.g.shelfIndex,
      level: 1,
      supportTop: below.node.y,
      solid: solidOf(n),
      edge: edgeOf(n),
    });
    used.add(n.id);
  }

  // Overlays: anything drawn above a standing item and lying entirely within
  // it travels with it (text on a name plate, a sticker on a frame).
  const standingNodes = groups.map((g) => ({ g, node: doc.nodes.find((n) => n.id === g.ids[0])! }));
  for (const m of doc.nodes) {
    if (used.has(m.id) || isShelfNode(doc, m)) continue;
    const mh = nodeHeight(m);
    const host = standingNodes.find(
      ({ node }) =>
        (order.get(m.id) ?? 0) > (order.get(node.id) ?? 0) &&
        m.x >= node.x - tol &&
        m.x + m.width <= node.x + node.width + tol &&
        m.y >= node.y - tol &&
        m.y + mh <= node.y + node.height + tol,
    );
    if (!host) continue;
    host.g.ids.push(m.id);
    used.add(m.id);
  }

  for (const g of groups) g.ids.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  return groups;
}
