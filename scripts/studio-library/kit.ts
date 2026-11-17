/**
 * Shared building blocks for the Design Studio library generator:
 * Pinterest-style pastel palettes, vector lettering (real Google fonts turned
 * into SVG paths, so every device renders them identically), and the
 * "die-cut" white sticker border.
 */
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

export interface Palette {
  key: string;
  name: string;
  light: string; // paper / background tint
  main: string; // primary fill
  accent: string; // stronger fill / stroke
  dark: string; // lettering, outlines
  pop: string; // small contrasting details
}

export const PALETTES: Palette[] = [
  { key: "blush", name: "Blush", light: "#fff4f6", main: "#f8c8d4", accent: "#ef8fa8", dark: "#a8435f", pop: "#ffd66b" },
  { key: "peach", name: "Peach", light: "#fff5ee", main: "#ffd3b6", accent: "#ff9f7a", dark: "#b3573a", pop: "#8fd9b6" },
  { key: "butter", name: "Butter", light: "#fffbea", main: "#fff0a8", accent: "#f7cf4f", dark: "#9a7412", pop: "#ef8fa8" },
  { key: "mint", name: "Mint", light: "#f0fcf6", main: "#c6efd9", accent: "#7fd1aa", dark: "#2f7a5c", pop: "#ffb4a2" },
  { key: "sky", name: "Sky", light: "#f1f8ff", main: "#c8e3ff", accent: "#86bdf0", dark: "#2f5f99", pop: "#ffd66b" },
  { key: "lavender", name: "Lavender", light: "#f7f3ff", main: "#e0d5ff", accent: "#b39cf0", dark: "#5d45a8", pop: "#ffc2d4" },
  { key: "sage", name: "Sage", light: "#f4f8f1", main: "#d7e6cf", accent: "#a3c294", dark: "#4f6e43", pop: "#f4c7a1" },
  { key: "terracotta", name: "Terracotta", light: "#fcf2ec", main: "#f2c7b2", accent: "#d98b6a", dark: "#8f4a31", pop: "#e9d8a6" },
  { key: "cherry", name: "Cherry", light: "#fff3f3", main: "#ffcfcf", accent: "#ee5d63", dark: "#9b1f2b", pop: "#7fc8a9" },
  { key: "lilac", name: "Lilac Pink", light: "#fdf3fb", main: "#f6d1ec", accent: "#e095cf", dark: "#86377a", pop: "#a0d8ef" },
  { key: "aqua", name: "Aqua", light: "#effcfc", main: "#c2eeee", accent: "#6fcfd0", dark: "#22777a", pop: "#ffb86b" },
  { key: "cocoa", name: "Cocoa", light: "#fbf6f0", main: "#ead9c6", accent: "#c49a74", dark: "#5e3d27", pop: "#f2b8c6" },
  { key: "brand", name: "Navy & Gold", light: "#faf6ee", main: "#f2e3c8", accent: "#c79a5d", dark: "#1e2a4a", pop: "#f3d9de" },
];

export const WHITE = "#ffffff";

// ─── Fonts → vector paths ─────────────────────────────────────────────────

const FONT_FILES = {
  pacifico: "pacifico/files/pacifico-latin-400-normal.woff",
  fredoka: "fredoka/files/fredoka-latin-700-normal.woff",
  greatVibes: "great-vibes/files/great-vibes-latin-400-normal.woff",
  dancing: "dancing-script/files/dancing-script-latin-700-normal.woff",
  poppins: "poppins/files/poppins-latin-700-normal.woff",
  playfair: "playfair-display/files/playfair-display-latin-700-italic.woff",
} as const;
export type FontKey = keyof typeof FONT_FILES;

const fontCache = new Map<FontKey, opentype.Font>();
function font(key: FontKey) {
  let f = fontCache.get(key);
  if (!f) {
    const buf = fs.readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", FONT_FILES[key]));
    f = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
    fontCache.set(key, f);
  }
  return f;
}

export interface TextShape {
  d: string;
  width: number;
  /** Visual bounds relative to the baseline origin. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Text as an SVG path with its baseline at y = 0, starting at x = 0. */
export function textPath(text: string, key: FontKey, size: number, letterSpacing = 0): TextShape {
  const f = font(key);
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  let x = 0;
  const parts: string[] = [];
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, 0, size);
    parts.push(p.toPathData(2));
    const bb = p.getBoundingBox();
    if (Number.isFinite(bb.x1) && bb.x2 > bb.x1) {
      x1 = Math.min(x1, bb.x1);
      y1 = Math.min(y1, bb.y1);
      x2 = Math.max(x2, bb.x2);
      y2 = Math.max(y2, bb.y2);
    }
    const next = glyphs[i + 1];
    const kern = next ? f.getKerningValue(g, next) : 0;
    x += ((g.advanceWidth ?? 0) + kern) * scale + letterSpacing;
  });
  if (!Number.isFinite(x1)) {
    x1 = 0;
    y1 = -size;
    x2 = x;
    y2 = 0;
  }
  return { d: parts.join(""), width: x, x1, y1, x2, y2 };
}

/** Splits a phrase into balanced lines (max 2–3) for round/square stickers. */
export function balanceLines(phrase: string, maxChars = 12): string[] {
  const words = phrase.split(" ");
  if (phrase.length <= maxChars || words.length === 1) return [phrase];
  let best = [phrase];
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.max(a.length, b.length);
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  if (bestScore > maxChars * 1.6 && words.length >= 3) {
    const third = Math.ceil(words.length / 3);
    return [words.slice(0, third).join(" "), words.slice(third, third * 2).join(" "), words.slice(third * 2).join(" ")].filter(Boolean);
  }
  return best;
}

// ─── SVG wrappers ─────────────────────────────────────────────────────────

/** White die-cut sticker border (+ hairline grey edge) around whatever is drawn. */
export function dieCutFilter(id: string, radius: number) {
  return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="${radius}" result="grow"/>
    <feMorphology in="SourceAlpha" operator="dilate" radius="${radius + 1.4}" result="edge"/>
    <feFlood flood-color="#d9d4cc"/><feComposite in2="edge" operator="in" result="edgeC"/>
    <feFlood flood-color="#ffffff"/><feComposite in2="grow" operator="in" result="white"/>
    <feMerge><feMergeNode in="edgeC"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

export interface StickerSvg {
  svg: string;
  width: number;
  height: number;
  /** Add the white die-cut border when rasterising (done with image ops — far faster than an SVG filter). */
  dieCut: boolean;
}

/**
 * Wraps a drawing (in a `box` coordinate space) into a sticker SVG with room
 * for the die-cut border.
 */
export function sticker(body: string, box: { x: number; y: number; w: number; h: number }, opts: { dieCut?: boolean; defs?: string } = {}): StickerSvg {
  const pad = Math.max(box.w, box.h) * (opts.dieCut ? 0.09 : 0.04);
  const vx = box.x - pad;
  const vy = box.y - pad;
  const vw = box.w + pad * 2;
  const vh = box.h + pad * 2;
  const radius = (Math.max(box.w, box.h) * 0.035).toFixed(2);
  void radius;
  const defs = opts.defs ?? "";
  const inner = body;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" width="${vw.toFixed(0)}" height="${vh.toFixed(0)}">${defs ? `<defs>${defs}</defs>` : ""}${inner}</svg>`,
    width: vw,
    height: vh,
    dieCut: Boolean(opts.dieCut),
  };
}

/** Tiny deterministic PRNG so the library regenerates identically. */
export function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
