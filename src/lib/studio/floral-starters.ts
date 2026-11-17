import { makeImage, makePhoto, makeShape, makeText, type DesignDoc, type DesignNode, type ImageNode } from "@/lib/studio/doc";
import { CHENILLE, CHENILLE_BORDERS } from "@/lib/studio/chenille-assets";

/**
 * Pipe-cleaner floral frames: a fuzzy chenille border (the locked skeleton)
 * around a photo, decorated with handmade-looking flowers. Every flower,
 * text and sticker is a normal element, so customers can move, resize,
 * recolour (swap) or delete any of them.
 *
 * Positions are fractions of the canvas, tuned for portrait frames.
 */

export const FLORAL_STARTERS = ["floralSunflower", "floralPastel", "floralRose", "floralGarland"] as const;
export type FloralStarter = (typeof FLORAL_STARTERS)[number];

type BorderColour = "brown" | "pink" | "white" | "gold" | "sage" | "navy";

/** One pipe-cleaner piece centred at (cx, cy), its longest side `size`, rotated around its centre. */
function piece(doc: DesignDoc, id: string, cx: number, cy: number, size: number, opts: { rotation?: number; flipX?: boolean; name?: string } = {}): ImageNode | null {
  const asset = CHENILLE[id];
  if (!asset) return null;
  const k = size / Math.max(asset.w, asset.h);
  const w = Math.round(asset.w * k);
  const h = Math.round(asset.h * k);
  const rot = opts.rotation ?? 0;
  const a = (rot * Math.PI) / 180;
  // Keep the whole (rotated) piece on the canvas so customers can always grab it.
  const halfX = (Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))) / 2;
  const halfY = (Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a))) / 2;
  const ccx = Math.min(Math.max(cx, halfX), doc.width - halfX);
  const ccy = Math.min(Math.max(cy, halfY), doc.height - halfY);
  // Konva rotates around the node's top-left corner — offset so the centre stays put.
  const x = ccx - ((w / 2) * Math.cos(a) - (h / 2) * Math.sin(a));
  const y = ccy - ((w / 2) * Math.sin(a) + (h / 2) * Math.cos(a));
  return makeImage(doc, asset.src, { width: asset.w, height: asset.h }, {
    name: opts.name ?? id.replace(/-/g, " "),
    x: Math.round(x),
    y: Math.round(y),
    width: w,
    height: h,
    rotation: rot,
    flipX: opts.flipX ?? false,
  });
}

function border(doc: DesignDoc, colour: BorderColour, fallback: string): DesignNode {
  const src = CHENILLE_BORDERS[`${doc.width}x${doc.height}-${colour}`];
  if (src) {
    return makeImage(doc, src, { width: doc.width, height: doc.height }, {
      name: "Fuzzy border",
      x: 0,
      y: 0,
      width: doc.width,
      height: doc.height,
      locked: true,
    });
  }
  // Custom sizes have no pre-made fuzzy border — a plain one keeps the layout.
  const m = Math.min(doc.width, doc.height);
  return makeShape(doc, "rect", {
    name: "Border",
    x: Math.round(m * 0.02),
    y: Math.round(m * 0.02),
    width: Math.round(doc.width - m * 0.04),
    height: Math.round(doc.height - m * 0.04),
    fill: "#00000000",
    stroke: fallback,
    strokeWidth: Math.round(m * 0.03),
    cornerRadius: Math.round(m * 0.03),
    locked: true,
  });
}

export function buildFloral(key: FloralStarter, doc: DesignDoc): DesignNode[] {
  const { width, height } = doc;
  const X = (f: number) => Math.round(width * f);
  const Y = (f: number) => Math.round(height * f);
  const nodes: (DesignNode | null)[] = [];
  const p = (id: string, fx: number, fy: number, fs: number, opts?: Parameters<typeof piece>[5]) => nodes.push(piece(doc, id, X(fx), Y(fy), X(fs), opts));

  if (key === "floralSunflower") {
    // Modelled on the shop's handmade sunflower frame.
    doc.background = { color: "#fffdf9", imageUrl: null, locked: false };
    nodes.push(border(doc, "brown", "#5b2a1c"));
    nodes.push(
      makePhoto(doc, { name: "Photo", x: X(0.45), y: Y(0.09), width: X(0.45), height: Y(0.45), stroke: "#ffffff", strokeWidth: 0, padding: 0, shadow: true }),
      makeText(doc, { name: "Message", text: "Be you", fontFamily: "caveat", fontSize: Y(0.04), fill: "#b03a3a", x: X(0.2), y: Y(0.2), width: X(0.22), height: Y(0.06) }),
      makeShape(doc, "rect", { name: "Quote label", x: X(0.42), y: Y(0.62), width: X(0.3), height: Y(0.065), fill: "#d8c29d", stroke: "#b89c6e", strokeWidth: 1, cornerRadius: Y(0.012), shadow: true }),
      makeText(doc, { name: "Quote", text: "I'm The Best Me\nI Can Possibly Be", fontFamily: "poppins", bold: true, fontSize: Y(0.019), lineHeight: 1.15, fill: "#2f2418", x: X(0.42), y: Y(0.632), width: X(0.3), height: Y(0.05) }),
    );
    p("spiral-pink", 0.13, 0.2, 0.36, { rotation: -8 });
    p("tulip-red", 0.82, 0.67, 0.14, { rotation: 8 });
    // Left column, top to bottom (leaves first so flowers sit on them).
    p("leaf-green", 0.33, 0.43, 0.24, { rotation: 10 });
    p("leaf-light", 0.06, 0.72, 0.2, { rotation: -110 });
    p("sunflower-classic", 0.14, 0.46, 0.27);
    p("daisy-white", 0.26, 0.53, 0.18, { rotation: 15 });
    p("blossom-peach", 0.12, 0.6, 0.2, { rotation: -10 });
    p("daisy-cream", 0.3, 0.63, 0.18, { rotation: 25 });
    // Bottom row.
    p("leaves-green", 0.44, 0.82, 0.24, { rotation: 35 });
    p("leaf-green", 0.68, 0.86, 0.22, { rotation: 80, flipX: true });
    p("sunflower-classic", 0.21, 0.82, 0.42, { rotation: 12 });
    p("daisy-white", 0.54, 0.83, 0.17, { rotation: -12 });
    p("blossom-babypink", 0.4, 0.93, 0.17);
    p("sunflower-lemon", 0.6, 0.93, 0.22, { rotation: 20 });
    p("daisy-cream", 0.82, 0.93, 0.17, { rotation: -20 });
  }

  if (key === "floralPastel") {
    doc.background = { color: "#fff7f8", imageUrl: null, locked: false };
    nodes.push(border(doc, "pink", "#e8a1b5"));
    nodes.push(
      makePhoto(doc, { name: "Photo", x: X(0.17), y: Y(0.16), width: X(0.66), height: Y(0.56), fill: "#ffffff", stroke: "#ffffff", strokeWidth: 0, padding: X(0.025), shadow: true, rotation: -2 }),
      makeText(doc, { name: "Caption", text: "Forever in bloom", fontFamily: "greatVibes", fontSize: Y(0.052), fill: "#a8435f", align: "left", x: X(0.17), y: Y(0.745), width: X(0.52), height: Y(0.07) }),
    );
    // Top-left cluster.
    p("leaves-sage", 0.2, 0.08, 0.26, { rotation: -60 });
    p("sprig-eucalyptus", 0.36, 0.06, 0.26, { rotation: 75 });
    p("daisy-pink", 0.1, 0.1, 0.24);
    p("blossom-lavender", 0.26, 0.15, 0.17, { rotation: 20 });
    p("daisy-white", 0.07, 0.25, 0.16, { rotation: -15 });
    p("butterfly-purple", 0.86, 0.12, 0.16, { rotation: 18 });
    // Bottom-right cluster.
    p("leaves-sage", 0.74, 0.9, 0.26, { rotation: 120 });
    p("sprig-eucalyptus", 0.6, 0.95, 0.24, { rotation: -100 });
    p("daisy-lilac", 0.88, 0.88, 0.24, { rotation: 10 });
    p("blossom-babypink", 0.78, 0.85, 0.15);
    p("daisy-white", 0.9, 0.72, 0.15, { rotation: 20 });
    p("blossom-mint", 0.66, 0.93, 0.13);
    p("spiral-purple", 0.09, 0.86, 0.17, { rotation: 12 });
  }

  if (key === "floralRose") {
    doc.background = { color: "#fdf0f2", imageUrl: null, locked: false };
    nodes.push(border(doc, "white", "#f3efe9"));
    nodes.push(
      makePhoto(doc, { name: "Photo", x: X(0.16), y: Y(0.12), width: X(0.68), height: Y(0.53), cornerRadius: X(0.34), fill: "#ffffff", stroke: "#ffffff", strokeWidth: X(0.012), padding: 0, shadow: true }),
      makeText(doc, { name: "Caption", text: "Love you always", fontFamily: "greatVibes", fontSize: Y(0.06), fill: "#9b1f2b", x: X(0.1), y: Y(0.665), width: X(0.8), height: Y(0.08) }),
    );
    p("bow-red", 0.5, 0.08, 0.26);
    p("leaf-dark", 0.2, 0.86, 0.24, { rotation: -40 });
    p("leaf-green", 0.8, 0.86, 0.24, { rotation: 40, flipX: true });
    p("leaves-green", 0.5, 0.92, 0.22);
    p("rose-red", 0.14, 0.9, 0.26);
    p("rose-pink", 0.33, 0.93, 0.2, { rotation: -10 });
    p("rose-red", 0.86, 0.9, 0.26, { flipX: true });
    p("rose-pink", 0.67, 0.93, 0.2, { rotation: 10 });
    p("bud-red", 0.5, 0.84, 0.16);
    p("heartfill-red", 0.12, 0.62, 0.12, { rotation: -15 });
    p("heart-pink", 0.89, 0.6, 0.11, { rotation: 12 });
    p("heart-pink", 0.1, 0.18, 0.09, { rotation: -10 });
  }

  if (key === "floralGarland") {
    doc.background = { color: "#fbfaf3", imageUrl: null, locked: false };
    nodes.push(border(doc, "sage", "#7fa874"));
    nodes.push(
      makePhoto(doc, { name: "Photo", x: X(0.14), y: Y(0.2), width: X(0.72), height: Y(0.5), fill: "#ffffff", stroke: "#ffffff", strokeWidth: 0, padding: X(0.02), shadow: true }),
      makeText(doc, { name: "Caption", text: "Happy Birthday", fontFamily: "pacifico", fontSize: Y(0.045), fill: "#4f6e43", x: X(0.1), y: Y(0.73), width: X(0.8), height: Y(0.07) }),
    );
    p("garland-spring", 0.5, 0.1, 0.9);
    p("garland-spring", 0.5, 0.9, 0.9, { flipX: true });
    p("butterfly-yellow", 0.85, 0.24, 0.13, { rotation: 20 });
    p("butterfly-blue", 0.14, 0.76, 0.12, { rotation: -15 });
    p("lavender-purple", 0.06, 0.45, 0.24, { rotation: 8 });
    p("lavender-lilac", 0.94, 0.5, 0.22, { rotation: -8 });
  }

  return nodes.filter((n): n is DesignNode => n !== null);
}
