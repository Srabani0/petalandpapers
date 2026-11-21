/**
 * Bouquet Builder: the catalogue (flowers, sizes, wraps, ribbons, greenery),
 * pricing, and turning a recipe into a design document.
 *
 * The recipe is the source of truth — it is what the workshop makes, and the
 * price is always computed from it on the server. The design document built
 * from it is the picture the customer approves (and what gets printed on the
 * order sheet).
 */
import { CHENILLE } from "@/lib/studio/chenille-assets";
import { emptyDoc, type BouquetRecipe, type DesignDoc, type DesignNode, type ImageNode, type TextNode } from "@/lib/studio/doc";

export const BOUQUET_CATEGORY_SLUG = "bouquet-builder";
export const BOUQUET_CANVAS = { width: 1000, height: 1250 } as const;

// ─── Catalogue (prices in ₹ — adjust freely) ──────────────────────────────

export const BOUQUET_SIZES = [
  { id: "mini", label: "Mini", maxStems: 6, base: 149, note: "Up to 6 flowers — a sweet little hello" },
  { id: "classic", label: "Classic", maxStems: 12, base: 199, note: "Up to 12 flowers — our most loved" },
  { id: "grand", label: "Grand", maxStems: 24, base: 299, note: "Up to 24 flowers — a big wow" },
] as const;
export type BouquetSize = (typeof BOUQUET_SIZES)[number]["id"];

type Kind = "sunflower" | "rose" | "tulip" | "daisy" | "blossom" | "loop" | "marigold" | "lotus" | "lavender" | "bud";

/** How each kind sits in a bouquet: head size relative to others and where the head is in its picture. */
const KIND: Record<Kind, { price: number; scale: number; headFrac: number; anchor: [number, number]; group: string }> = {
  sunflower: { price: 39, scale: 1.15, headFrac: 1, anchor: [0.5, 0.5], group: "Sunflowers" },
  rose: { price: 35, scale: 1.05, headFrac: 0.72, anchor: [0.5, 0.42], group: "Roses" },
  tulip: { price: 30, scale: 0.8, headFrac: 0.5, anchor: [0.5, 0.25], group: "Tulips" },
  daisy: { price: 25, scale: 0.95, headFrac: 1, anchor: [0.5, 0.5], group: "Daisies" },
  blossom: { price: 22, scale: 0.85, headFrac: 1, anchor: [0.5, 0.5], group: "Blossoms" },
  loop: { price: 25, scale: 0.95, headFrac: 1, anchor: [0.5, 0.5], group: "Blossoms" },
  marigold: { price: 30, scale: 0.95, headFrac: 1, anchor: [0.5, 0.5], group: "Specials" },
  lotus: { price: 45, scale: 1.1, headFrac: 0.92, anchor: [0.5, 0.48], group: "Specials" },
  lavender: { price: 20, scale: 0.75, headFrac: 0.55, anchor: [0.5, 0.3], group: "Specials" },
  bud: { price: 15, scale: 0.65, headFrac: 0.38, anchor: [0.5, 0.3], group: "Specials" },
};

const kindOf = (id: string): Kind | null => {
  const k = id.split("-")[0];
  if (k === "loopflower") return "loop";
  return (k in KIND ? k : null) as Kind | null;
};

const NICE: Record<string, string> = {
  babypink: "Baby pink",
  loopflower: "Loop flower",
};
const label = (id: string) => {
  const [kind, colour] = id.split("-");
  const c = NICE[colour] ?? colour.charAt(0).toUpperCase() + colour.slice(1);
  const k = NICE[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1);
  return kind === "sunflower" && colour === "classic" ? "Sunflower" : `${c} ${k.toLowerCase()}`;
};

export interface BouquetFlower {
  id: string;
  name: string;
  group: string;
  price: number;
  src: string;
  thumb: string;
}

export const BOUQUET_FLOWERS: BouquetFlower[] = Object.keys(CHENILLE)
  .filter((id) => kindOf(id))
  .map((id) => {
    const kind = kindOf(id)!;
    return {
      id,
      name: label(id),
      group: KIND[kind].group,
      price: KIND[kind].price,
      src: CHENILLE[id].src,
      thumb: CHENILLE[id].src.replace("/chenille/", "/chenille/t/"),
    };
  })
  .sort((a, b) => Object.keys(KIND).indexOf(kindOf(a.id)!) - Object.keys(KIND).indexOf(kindOf(b.id)!));

export const BOUQUET_GROUPS = [...new Set(BOUQUET_FLOWERS.map((f) => f.group))];

export const WRAPS = [
  { id: "kraft", label: "Kraft", colour: "#c9a27a", price: 0 },
  { id: "blush", label: "Blush pink", colour: "#f2c4cd", price: 29 },
  { id: "ivory", label: "Ivory", colour: "#f1ebdf", price: 29 },
  { id: "lilac", label: "Lilac", colour: "#cfbde8", price: 29 },
  { id: "sky", label: "Sky blue", colour: "#bcd6ee", price: 29 },
  { id: "sage", label: "Sage", colour: "#c3d4bb", price: 29 },
  { id: "black", label: "Midnight", colour: "#2c2c33", price: 39 },
] as const;

export const RIBBONS = [
  { id: "red", label: "Red", colour: "#c8323f" },
  { id: "pink", label: "Pink", colour: "#ec8fb0" },
  { id: "gold", label: "Gold", colour: "#c79a3d" },
  { id: "ivory", label: "Ivory", colour: "#f3ede2" },
  { id: "navy", label: "Navy", colour: "#24345e" },
  { id: "lilac", label: "Lilac", colour: "#a98bd6" },
] as const;

export const FILLERS = [
  { id: "leaves", label: "Green leaves", asset: "leaves-green", price: 25 },
  { id: "eucalyptus", label: "Eucalyptus", asset: "sprig-eucalyptus", price: 25 },
  { id: "sage", label: "Sage leaves", asset: "leaves-sage", price: 25 },
  { id: "fern", label: "Leafy sprigs", asset: "sprig-green", price: 25 },
] as const;

export const DEFAULT_RECIPE: BouquetRecipe = {
  size: "classic",
  flowers: [
    { id: "sunflower-classic", count: 3 },
    { id: "rose-pink", count: 3 },
    { id: "daisy-white", count: 3 },
  ],
  wrap: "kraft",
  ribbon: "red",
  fillers: ["leaves"],
  message: "Happy Birthday!",
  from: "",
};

// ─── Pricing ──────────────────────────────────────────────────────────────

export type RecipeCheck = { error: string } | { total: number; stems: number; lines: { label: string; amount: number }[] };

/** Validates a recipe against the catalogue and prices it. Used by both the builder and the server. */
export function priceRecipe(recipe: BouquetRecipe): RecipeCheck {
  const size = BOUQUET_SIZES.find((s) => s.id === recipe.size);
  const wrap = WRAPS.find((w) => w.id === recipe.wrap);
  if (!size || !wrap || !RIBBONS.some((r) => r.id === recipe.ribbon)) return { error: "Please choose a size, wrap and ribbon." };
  const lines: { label: string; amount: number }[] = [{ label: `${size.label} bouquet`, amount: size.base }];
  let stems = 0;
  const seen = new Set<string>();
  for (const f of recipe.flowers) {
    const flower = BOUQUET_FLOWERS.find((x) => x.id === f.id);
    if (!flower || seen.has(f.id)) return { error: "One of the flowers isn't available any more." };
    seen.add(f.id);
    stems += f.count;
    lines.push({ label: `${f.count} × ${flower.name}`, amount: f.count * flower.price });
  }
  if (stems === 0) return { error: "Add at least one flower." };
  if (stems > size.maxStems) return { error: `A ${size.label} bouquet holds up to ${size.maxStems} flowers.` };
  if (wrap.price) lines.push({ label: `${wrap.label} wrapping`, amount: wrap.price });
  for (const id of new Set(recipe.fillers)) {
    const filler = FILLERS.find((x) => x.id === id);
    if (!filler) return { error: "One of the greenery options isn't available any more." };
    lines.push({ label: filler.label, amount: filler.price });
  }
  return { total: lines.reduce((s, l) => s + l.amount, 0), stems, lines };
}

// ─── Arrangement → design document ────────────────────────────────────────

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const DOME: Record<BouquetSize, { rx: number; ry: number }> = {
  mini: { rx: 205, ry: 150 },
  classic: { rx: 245, ry: 170 },
  grand: { rx: 300, ry: 205 },
};

function piece(src: string, w: number, h: number, cx: number, cy: number, over: Partial<ImageNode> & { id: string }): ImageNode {
  const rot = over.rotation ?? 0;
  const a = (rot * Math.PI) / 180;
  // Rotate around the given centre (Konva rotates around the top-left corner).
  const x = cx - ((w / 2) * Math.cos(a) - (h / 2) * Math.sin(a));
  const y = cy - ((w / 2) * Math.sin(a) + (h / 2) * Math.cos(a));
  return {
    type: "image",
    src,
    flipX: false,
    opacity: 1,
    locked: true,
    shadow: false,
    ...over,
    rotation: rot,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(w),
    height: Math.round(h),
  };
}

/** Builds the picture of a bouquet from its recipe. Deterministic: the same recipe always looks the same. */
export function buildBouquetDoc(recipe: BouquetRecipe): DesignDoc {
  const { width: W, height: H } = BOUQUET_CANVAS;
  const doc = emptyDoc(W, H);
  doc.background = { color: "#fbf6ef", imageUrl: null, locked: true };
  doc.meta = { bouquet: recipe };
  const nodes: DesignNode[] = [];
  const dome = DOME[recipe.size] ?? DOME.classic;
  const cx = W / 2;
  const cy = 470;
  const full = (id: string, src: string): ImageNode => piece(src, W, H, W / 2, H / 2, { id, name: id });

  nodes.push(full("bq-wrap-back", `/studio/bouquet/wrap-back-${recipe.wrap}.webp`));

  // Greenery peeking out around the top of the dome.
  const rand = rng(recipe.flowers.reduce((s, f) => s + f.count * 31 + f.id.length, 7));
  [...new Set(recipe.fillers)].forEach((fid, fi) => {
    const filler = FILLERS.find((f) => f.id === fid);
    const asset = filler && CHENILLE[filler.asset];
    if (!asset) return;
    const angles = [205, 245, 295, 335].map((a) => a + fi * 12);
    angles.forEach((deg, j) => {
      const a = (deg * Math.PI) / 180;
      const size = dome.rx * 0.78;
      const k = size / Math.max(asset.w, asset.h);
      nodes.push(
        piece(asset.src, asset.w * k, asset.h * k, cx + Math.cos(a) * dome.rx * 0.95, cy + Math.sin(a) * dome.ry * 1.05, {
          id: `bq-fill-${fi}-${j}`,
          name: filler.label,
          rotation: deg + 90 + (rand() - 0.5) * 20,
          flipX: j % 2 === 1,
        }),
      );
    });
  });

  nodes.push(piece("/studio/bouquet/stems.webp", 600, 600, cx, 690, { id: "bq-stems", name: "Stems" }));

  // One entry per stem, biggest flowers first so they take the centre.
  const stems = recipe.flowers
    .flatMap((f) => Array.from({ length: f.count }, () => f.id))
    .filter((id) => CHENILLE[id] && kindOf(id))
    .sort((a, b) => KIND[kindOf(b)!].scale - KIND[kindOf(a)!].scale);
  const n = Math.max(1, stems.length);
  const area = (Math.PI * dome.rx * dome.ry) / n;
  const base = Math.min(270, Math.sqrt(area) * 1.6);
  const placed = stems.map((id, i) => {
    // Sunflower-seed spiral: evenly fills the dome from the centre out.
    const r = Math.sqrt((i + 0.5) / n);
    const t = i * 2.39996323;
    return { id, x: cx + Math.cos(t) * r * dome.rx, y: cy + Math.sin(t) * r * dome.ry * 0.95 - (1 - r) * 18, i };
  });
  placed
    .sort((a, b) => a.y - b.y) // back rows first
    .forEach(({ id, x, y, i }) => {
      const kind = KIND[kindOf(id)!];
      const asset = CHENILLE[id];
      const head = base * kind.scale;
      const longest = head / kind.headFrac;
      const k = longest / Math.max(asset.w, asset.h);
      const w = asset.w * k;
      const h = asset.h * k;
      // Put the flower *head* on the point.
      const centreX = x + (0.5 - kind.anchor[0]) * w;
      const centreY = y + (0.5 - kind.anchor[1]) * h;
      nodes.push(
        piece(asset.src, w, h, centreX, centreY, {
          id: `bq-f-${i}`,
          name: label(id),
          rotation: (rand() - 0.5) * 24,
          flipX: rand() > 0.5,
        }),
      );
    });

  nodes.push(full("bq-wrap-front", `/studio/bouquet/wrap-front-${recipe.wrap}.webp`));
  nodes.push(piece(`/studio/bouquet/ribbon-${recipe.ribbon}.webp`, 300, 271, cx, 905, { id: "bq-ribbon", name: "Ribbon" }));

  // Gift tag with the message, hanging a little to the right and tilted.
  if (recipe.message.trim() || recipe.from.trim()) {
    const tagW = 200;
    const tagH = Math.round(tagW * (380 / 300));
    const tag = piece("/studio/bouquet/tag.webp", tagW, tagH, 650, 1010, { id: "bq-tag", name: "Gift tag", rotation: 9 });
    nodes.push(tag);
    const a = (tag.rotation * Math.PI) / 180;
    const at = (ox: number, oy: number) => ({ x: tag.x + ox * Math.cos(a) - oy * Math.sin(a), y: tag.y + ox * Math.sin(a) + oy * Math.cos(a) });
    const k = tagW / 300;
    const text = (id: string, value: string, oy: number, fontSize: number, family: TextNode["fontFamily"], height: number): TextNode => ({
      id,
      type: "text",
      name: id === "bq-msg" ? "Tag message" : "Tag signature",
      text: value,
      fontFamily: family,
      fontSize,
      fill: "#4a2e17",
      align: "center",
      bold: false,
      italic: false,
      underline: false,
      lineHeight: 1.15,
      letterSpacing: 0,
      stroke: "#000000",
      strokeWidth: 0,
      opacity: 1,
      locked: true,
      shadow: false,
      rotation: tag.rotation,
      width: Math.round(236 * k),
      height,
      ...at(32 * k, oy * k),
    });
    if (recipe.message.trim()) nodes.push(text("bq-msg", recipe.message.trim(), 110, recipe.message.length > 40 ? 22 : 27, "dancing", Math.round(170 * k)));
    if (recipe.from.trim()) nodes.push(text("bq-from", `— ${recipe.from.trim()}`, 300, 20, "dancing", 30));
  }

  doc.nodes = nodes;
  return doc;
}
