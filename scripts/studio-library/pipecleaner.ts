/**
 * Generates the pipe-cleaner (chenille) craft library: handmade-looking
 * flowers, leaves, springs, hearts… plus fuzzy frame borders sized for every
 * frame/card preset, used by the "Pipe-cleaner floral frame" templates.
 *
 *   npm run studio:library:chenille            (everything)
 *   npm run studio:library:chenille -- --only=sunflower-classic,daisy-white   (preview a few)
 *
 * Writes public/studio/library/chenille/, manifest-chenille.json, and
 * src/lib/studio/chenille-assets.ts (ids → files, used by the starters).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SIZE_PRESETS } from "../../src/lib/studio/doc";
import { coil, filledPetal, heart, petalLoop, renderStrands, roundedRect, spring, star, stem, type Pt, type Strand } from "./chenille";
import { rng } from "./kit";

const OUT = path.join(process.cwd(), "public", "studio", "library", "chenille");
const ASSETS_TS = path.join(process.cwd(), "src", "lib", "studio", "chenille-assets.ts");
const MAX = 800;
const THUMB = 160;
const R = 16; // fibre radius in the 1000-unit drawing space

interface Item {
  id: string;
  name: string;
  tags: string[];
  draw: () => Strand[];
}

const C = 500;
const S = (pts: Pt[], color: string, r = R, closed = false): Strand => ({ pts, color, r, closed });
const many = (loops: Pt[][], color: string, r = R): Strand[] => loops.map((p) => S(p, color, r));

const GREEN = "#55a03c";

/** Lighten (t > 0) or darken (t < 0) a colour a little — tells overlapping petals apart. */
function tint(colour: string, t: number) {
  const v = colour.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  const target = t > 0 ? 255 : 30;
  return "#" + c.map((x) => Math.round(x + (target - x) * Math.abs(t)).toString(16).padStart(2, "0")).join("");
}

// ─── Flowers & friends ────────────────────────────────────────────────────

function sunflower(petal: string, centre: string, seed: number): Strand[] {
  const rand = rng(seed);
  const out: Strand[] = [];
  const n = 16;
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < n; i++) {
      const a = ((i + ring * 0.5) / n) * Math.PI * 2 + (rand() - 0.5) * 0.08;
      const len = (ring ? 290 : 340) + (rand() - 0.5) * 30;
      out.push(S(petalLoop(C, C, a, len, ring ? 40 : 46, { base: 110, wobble: 0.25, seed: seed + i + ring * 50 }), petal));
    }
  }
  out.push(S(coil(C, C, 150, R * 1.75, { wobble: 1, seed }), centre, R * 1.15));
  return out;
}

function daisy(petal: string, centre: string, seed: number, n = 6): Strand[] {
  const rand = rng(seed);
  const out: Strand[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (rand() - 0.5) * 0.1;
    out.push(...many(filledPetal(C, C, a, 330 + (rand() - 0.5) * 30, n > 5 ? 112 : 135, R, { base: 50, wobble: 0.3, seed: seed + i * 7 }), petal));
  }
  out.push(S(coil(C, C, 95, R * 1.7, { seed }), centre));
  return out;
}

function openFlower(petal: string, centre: string, seed: number): Strand[] {
  const out: Strand[] = [];
  for (let i = 0; i < 8; i++) {
    out.push(S(petalLoop(C, C, (i / 8) * Math.PI * 2, 340, 78, { base: 60, shape: "oval", wobble: 0.2, seed: seed + i }), petal));
  }
  out.push(S(coil(C, C, 90, R * 1.7, { seed }), centre));
  return out;
}

function rose(colour: string, seed: number): Strand[] {
  return [
    ...many(filledPetal(C, C + 80, Math.PI * 0.78, 380, 120, R, { shape: "pointy", seed }), GREEN),
    ...many(filledPetal(C, C + 80, Math.PI * 0.22, 380, 120, R, { shape: "pointy", seed: seed + 3 }), GREEN),
    S(coil(C, C - 30, 250, R * 2.05, { wobble: 1.1, seed, squash: 0.92 }), colour, R * 1.4),
  ];
}

function tulip(colour: string, seed: number): Strand[] {
  const up = -Math.PI / 2;
  return [
    S(stem([C, 980], [C, 470], 30), GREEN),
    ...many(filledPetal(C + 6, 900, up - 0.55, 420, 95, R, { shape: "pointy", seed }), GREEN),
    ...many(filledPetal(C, 500, up - 0.5, 330, 95, R, { shape: "pointy", seed: seed + 1 }), tint(colour, -0.12)),
    ...many(filledPetal(C, 500, up + 0.5, 330, 95, R, { shape: "pointy", seed: seed + 2 }), tint(colour, -0.12)),
    ...many(filledPetal(C, 510, up, 380, 110, R, { shape: "pointy", seed: seed + 3 }), colour),
  ];
}

function marigold(colour: string, seed: number): Strand[] {
  const rand = rng(seed);
  const out: Strand[] = [];
  for (const [n, len, base, w] of [[22, 250, 100, 30], [18, 200, 70, 30], [14, 140, 40, 28]] as const) {
    for (let i = 0; i < n; i++) {
      out.push(S(petalLoop(C, C, (i / n) * Math.PI * 2 + rand() * 0.3, len + (rand() - 0.5) * 30, w, { base, wobble: 0.4, seed: seed + i + n }), colour));
    }
  }
  out.push(S(coil(C, C, 55, R * 1.7, { seed }), colour));
  return out;
}

function lotus(colour: string, seed: number): Strand[] {
  const out: Strand[] = [];
  const base: Pt = [C, 720];
  for (const a of [-2.55, -0.59]) out.push(...many(filledPetal(base[0], base[1], a, 320, 100, R, { shape: "pointy", seed: seed + a * 10 }), GREEN));
  for (const [a, t] of [[-2.35, -0.14], [-0.79, -0.14], [-1.95, 0.08], [-1.19, 0.08], [-1.57, 0.22]] as const) {
    out.push(...many(filledPetal(base[0], base[1], a, a === -1.57 ? 480 : 420, 115, R, { shape: "pointy", seed: seed + Math.round(a * 100) }), tint(colour, t)));
  }
  return out;
}

function leaf(colour: string, seed: number): Strand[] {
  const loops = filledPetal(220, 820, -Math.PI / 4, 820, 190, R, { shape: "pointy", wobble: 0.15, seed });
  return [...many(loops, colour), S(stem([150, 890], [700, 340], 25), colour, R * 0.8)];
}

function leafPair(colour: string, seed: number): Strand[] {
  return [
    S(stem([C, 980], [C, 560], 20), colour, R * 0.85),
    ...many(filledPetal(C, 620, -Math.PI * 0.75, 430, 120, R, { shape: "pointy", seed }), colour),
    ...many(filledPetal(C, 620, -Math.PI * 0.25, 430, 120, R, { shape: "pointy", seed: seed + 1 }), colour),
    ...many(filledPetal(C, 560, -Math.PI / 2, 420, 115, R, { shape: "pointy", seed: seed + 2 }), colour),
  ];
}

function sprig(colour: string, seed: number): Strand[] {
  const out: Strand[] = [S(stem([C, 990], [C + 40, 40], 60), colour, R * 0.85)];
  for (let i = 0; i < 5; i++) {
    const y = 820 - i * 160;
    const side = i % 2 ? 1 : -1;
    out.push(...many(filledPetal(C + i * 8, y, -Math.PI / 2 + side * 0.95, 260 - i * 18, 80, R, { shape: "pointy", seed: seed + i }), colour));
  }
  out.push(...many(filledPetal(C + 40, 130, -Math.PI / 2, 150, 60, R, { shape: "pointy", seed: seed + 9 }), colour));
  return out;
}

function lavender(colour: string, seed: number): Strand[] {
  const rand = rng(seed);
  const out: Strand[] = [S(stem([C, 990], [C + 20, 80], 40), GREEN, R * 0.8)];
  for (let i = 0; i < 16; i++) {
    const y = 470 - i * 24;
    const side = i % 2 ? 1 : -1;
    out.push(S(petalLoop(C + 10, y, -Math.PI / 2 + side * (0.75 + rand() * 0.2), 120 - i * 3, 34, { seed: seed + i }), colour, R * 0.9));
  }
  return out;
}

function springCurl(colour: string): Strand[] {
  return spring(C, 40, C, 960, 130, 6.5, colour, R * 1.15);
}

function heartOutline(colour: string): Strand[] {
  return [S(heart(C, 520, 430), colour, R * 1.1, true)];
}

function heartFilled(colour: string): Strand[] {
  return [0.97, 0.86, 0.75, 0.64, 0.53, 0.42, 0.31, 0.2, 0.1].map((k) => S(heart(C, 520 + (1 - k) * 40, 430 * k), colour, R, true));
}

function butterfly(upper: string, lower: string, seed: number): Strand[] {
  const body: Pt = [C, 520];
  return [
    ...many(filledPetal(body[0], body[1] + 40, Math.PI * 0.72, 280, 110, R, { seed: seed + 2 }), lower),
    ...many(filledPetal(body[0], body[1] + 40, Math.PI * 0.28, 280, 110, R, { seed: seed + 3 }), lower),
    ...many(filledPetal(body[0], body[1], -Math.PI * 0.84, 390, 155, R, { seed }), upper),
    ...many(filledPetal(body[0], body[1], -Math.PI * 0.16, 390, 155, R, { seed: seed + 1 }), upper),
    S(stem([C, 330], [C, 760], 0), "#4a3426", R * 1.25),
    S(stem([C - 5, 335], [C - 120, 140], -40), "#4a3426", R * 0.7),
    S(stem([C + 5, 335], [C + 120, 140], 40), "#4a3426", R * 0.7),
    S(coil(C - 122, 132, 24, R * 1.2), "#4a3426", R * 0.8),
    S(coil(C + 122, 132, 24, R * 1.2), "#4a3426", R * 0.8),
  ];
}

function bow(colour: string, seed: number): Strand[] {
  return [
    S(stem([C - 10, 520], [C - 220, 900], -60), colour, R * 1.1),
    S(stem([C + 10, 520], [C + 220, 900], 60), colour, R * 1.1),
    ...many(filledPetal(C, 470, Math.PI + 0.12, 380, 150, R, { shape: "oval", seed }), colour),
    ...many(filledPetal(C, 470, -0.12, 380, 150, R, { shape: "oval", seed: seed + 1 }), colour),
    S(coil(C, 470, 60, R * 1.6), colour),
  ];
}

function starShape(colour: string): Strand[] {
  return [S(star(C, 520, 440), colour, R * 1.1, true), S(star(C, 520, 300), colour, R, true), S(star(C, 520, 160), colour, R, true)];
}

function bud(colour: string, seed: number): Strand[] {
  return [
    S(stem([C, 990], [C, 460], -30), GREEN, R * 0.85),
    ...many(filledPetal(C, 800, -Math.PI * 0.2, 260, 75, R, { shape: "pointy", seed }), GREEN),
    ...many(filledPetal(C, 470, -Math.PI / 2, 330, 105, R, { shape: "pointy", seed: seed + 1 }), colour),
    ...many(filledPetal(C, 480, -Math.PI / 2 - 0.55, 170, 55, R, { shape: "pointy", seed: seed + 2 }), GREEN),
    ...many(filledPetal(C, 480, -Math.PI / 2 + 0.55, 170, 55, R, { shape: "pointy", seed: seed + 3 }), GREEN),
  ];
}

// ─── Bouquets: several pieces arranged together ───────────────────────────

/** Moves/scales another drawing (scale also thins the fibres, like a smaller flower would). */
function place(strands: Strand[], x: number, y: number, k: number): Strand[] {
  return strands.map((s) => ({ ...s, r: Math.max(5, s.r * Math.max(k, 0.62)), pts: s.pts.map(([px, py]) => [x + (px - C) * k, y + (py - C) * k] as Pt) }));
}

function cornerSunflower(): Strand[] {
  return [
    ...place(leaf(GREEN, 4), 260, 300, 0.55),
    ...place(leafPair(GREEN, 6), 820, 820, 0.5),
    ...place(daisy("#ffffff", "#f6cf3a", 5), 330, 380, 0.42),
    ...place(blossomish("#ffe2cc", "#f27fa5", 6), 300, 640, 0.36),
    ...place(daisy("#f3f0d0", "#6aa84f", 8), 600, 820, 0.36),
    ...place(sunflower("#f7d12e", "#5a2d17", 3), 420, 640, 0.62),
    ...place(sunflower("#f7d12e", "#5a2d17", 9), 760, 640, 0.33),
  ];
}

function cornerDaisy(): Strand[] {
  return [
    ...place(leafPair("#8fbf7a", 2), 300, 300, 0.55),
    ...place(sprig("#7fae9a", 3), 760, 760, 0.55),
    ...place(daisy("#f7a8c4", "#f8d34a", 4), 380, 420, 0.5),
    ...place(daisy("#ffffff", "#f6cf3a", 5), 640, 600, 0.45),
    ...place(blossomish("#d7c4f2", "#ffffff", 7), 330, 700, 0.42),
    ...place(blossomish("#ffc2d6", "#ffffff", 8), 700, 330, 0.36),
  ];
}

function cornerRose(): Strand[] {
  return [
    ...place(leaf(GREEN, 5), 300, 330, 0.55),
    ...place(leaf("#2f7d32", 6), 760, 720, 0.5),
    ...place(rose("#f48fb1", 1), 640, 520, 0.5),
    ...place(rose("#d7263d", 2), 380, 600, 0.6),
    ...place(bud("#d7263d", 3), 720, 260, 0.4),
  ];
}

function garland(): Strand[] {
  const out: Strand[] = [S(stem([60, 520], [1940, 520], 70), GREEN, R * 0.85)];
  const flowers = [
    daisy("#ffffff", "#f6cf3a", 1),
    blossomish("#ffc2d6", "#ffffff", 2),
    sunflower("#f7d12e", "#5a2d17", 3),
    daisy("#d7c4f2", "#ffffff", 4),
    blossomish("#ffd9c2", "#f27fa5", 5),
    daisy("#9cc9f0", "#ffffff", 6),
  ];
  for (let i = 0; i < 7; i++) out.push(...place(filledLeafOnly(i), 180 + i * 270, 500, 0.32));
  flowers.forEach((f, i) => out.push(...place(f, 260 + i * 300, 520 + (i % 2 ? -30 : 30), 0.3)));
  return out;
}

function filledLeafOnly(seed: number) {
  return many(filledPetal(C, C, seed % 2 ? -0.6 : Math.PI + 0.6, 380, 110, R, { shape: "pointy", seed }), GREEN);
}

function blossomish(petal: string, centre: string, seed: number) {
  return daisy(petal, centre, seed, 5);
}

// ─── Catalogue ────────────────────────────────────────────────────────────

const ITEMS: Item[] = [];
const add = (id: string, name: string, tags: string[], draw: () => Strand[]) => ITEMS.push({ id, name, tags, draw });

for (const [key, name, p, c] of [
  ["classic", "Sunflower", "#f7d12e", "#5a2d17"],
  ["golden", "Golden sunflower", "#f4b400", "#3d2210"],
  ["lemon", "Lemon sunflower", "#fbe55a", "#6b4a2b"],
] as const) add(`sunflower-${key}`, name, ["sunflower", "flower", "yellow"], () => sunflower(p, c, 11 + key.length));

for (const [key, name, p, c] of [
  ["white", "White daisy", "#ffffff", "#f6cf3a"],
  ["cream", "Cream daisy", "#f3f0d0", "#6aa84f"],
  ["pink", "Pink daisy", "#f7a8c4", "#f8d34a"],
  ["lilac", "Lilac daisy", "#c8a8e8", "#ffffff"],
  ["sky", "Sky blue daisy", "#9cc9f0", "#ffffff"],
  ["peach", "Peach daisy", "#ffc9a8", "#f27fa5"],
  ["red", "Red daisy", "#e8384f", "#f8d34a"],
  ["butter", "Butter daisy", "#ffe680", "#7a4a2b"],
] as const) add(`daisy-${key}`, name, ["daisy", "flower", key], () => daisy(p, c, 21 + key.length));

for (const [key, name, p, c] of [
  ["peach", "Peach blossom", "#ffd9c2", "#f27fa5"],
  ["white", "White blossom", "#ffffff", "#f48fb1"],
  ["babypink", "Baby pink blossom", "#ffc2d6", "#ffffff"],
  ["lavender", "Lavender blossom", "#d7c4f2", "#f6cf3a"],
  ["mint", "Mint blossom", "#bfe8cf", "#ffffff"],
  ["coral", "Coral blossom", "#ff8f7a", "#f8d34a"],
] as const) add(`blossom-${key}`, name, ["blossom", "flower", "five petal", key], () => blossomish(p, c, 31 + key.length));

for (const [key, name, p, c] of [
  ["yellow", "Yellow loop flower", "#f7d12e", "#6b3a1e"],
  ["pink", "Pink loop flower", "#f48fb1", "#ffffff"],
  ["purple", "Purple loop flower", "#9b6bd6", "#f8d34a"],
  ["blue", "Blue loop flower", "#5aa9e6", "#f8d34a"],
  ["orange", "Orange loop flower", "#ff9548", "#6b3a1e"],
] as const) add(`loopflower-${key}`, name, ["flower", "loop", key], () => openFlower(p, c, 41 + key.length));

for (const [key, name, c] of [
  ["red", "Red rose", "#d7263d"],
  ["pink", "Pink rose", "#f48fb1"],
  ["peach", "Peach rose", "#ffab91"],
  ["white", "White rose", "#f6f1ea"],
  ["lilac", "Lilac rose", "#c39bd3"],
  ["yellow", "Yellow rose", "#f9d94a"],
  ["burgundy", "Burgundy rose", "#8e1b3a"],
] as const) add(`rose-${key}`, name, ["rose", "flower", "love", key], () => rose(c, 51 + key.length));

for (const [key, name, c] of [
  ["red", "Red tulip", "#e23b4b"],
  ["pink", "Pink tulip", "#f48fb1"],
  ["yellow", "Yellow tulip", "#f9d94a"],
  ["purple", "Purple tulip", "#9b59b6"],
  ["orange", "Orange tulip", "#ff8c42"],
  ["white", "White tulip", "#f6f1ea"],
] as const) add(`tulip-${key}`, name, ["tulip", "flower", key], () => tulip(c, 61 + key.length));

add("marigold-orange", "Marigold (genda)", ["marigold", "genda", "flower", "diwali", "festival", "orange"], () => marigold("#ff9f1c", 71));
add("marigold-yellow", "Yellow marigold", ["marigold", "genda", "flower", "festival", "yellow"], () => marigold("#ffcf33", 72));
add("lotus-pink", "Pink lotus", ["lotus", "kamal", "flower", "festival", "pink"], () => lotus("#f48fb1", 73));
add("lotus-white", "White lotus", ["lotus", "kamal", "flower", "white"], () => lotus("#f6f1ea", 74));

add("leaf-green", "Leaf", ["leaf", "green"], () => leaf(GREEN, 81));
add("leaf-dark", "Dark green leaf", ["leaf", "green"], () => leaf("#2f7d32", 82));
add("leaf-light", "Light green leaf", ["leaf", "green"], () => leaf("#9ccc65", 83));
add("leaves-green", "Leaf trio", ["leaf", "leaves", "green"], () => leafPair(GREEN, 84));
add("leaves-sage", "Sage leaf trio", ["leaf", "leaves", "sage"], () => leafPair("#8fbf7a", 85));
add("sprig-green", "Leafy sprig", ["leaf", "sprig", "branch", "green"], () => sprig(GREEN, 86));
add("sprig-eucalyptus", "Eucalyptus sprig", ["leaf", "sprig", "eucalyptus"], () => sprig("#7fae9a", 87));
add("lavender-purple", "Lavender", ["lavender", "flower", "purple"], () => lavender("#8e6bbf", 88));
add("lavender-lilac", "Lilac lavender", ["lavender", "flower", "lilac"], () => lavender("#b39ddb", 89));
add("bud-pink", "Pink bud", ["bud", "flower", "pink"], () => bud("#f48fb1", 90));
add("bud-red", "Red bud", ["bud", "flower", "red"], () => bud("#d7263d", 91));

for (const [key, name, c] of [
  ["pink", "Pink spiral", "#f7a1c4"],
  ["purple", "Purple spiral", "#a77bd6"],
  ["yellow", "Yellow spiral", "#f9d94a"],
  ["blue", "Blue spiral", "#7ec8e3"],
  ["mint", "Mint spiral", "#98d8b0"],
  ["white", "White spiral", "#f6f1ea"],
  ["red", "Red spiral", "#e23b4b"],
] as const) add(`spiral-${key}`, name, ["spiral", "curl", "spring", "coil", key], () => springCurl(c));

add("heart-red", "Red heart", ["heart", "love", "red"], () => heartOutline("#e23b4b"));
add("heart-pink", "Pink heart", ["heart", "love", "pink"], () => heartOutline("#f48fb1"));
add("heart-gold", "Gold heart", ["heart", "love", "gold"], () => heartOutline("#e0a526"));
add("heartfill-red", "Fluffy red heart", ["heart", "love", "red"], () => heartFilled("#e23b4b"));
add("heartfill-pink", "Fluffy pink heart", ["heart", "love", "pink"], () => heartFilled("#f7a1c4"));

for (const [key, name, u, l] of [
  ["pink", "Pink butterfly", "#f48fb1", "#9cc9f0"],
  ["blue", "Blue butterfly", "#5aa9e6", "#f9d94a"],
  ["yellow", "Yellow butterfly", "#f9d94a", "#ff8c42"],
  ["purple", "Purple butterfly", "#a77bd6", "#f7a1c4"],
] as const) add(`butterfly-${key}`, name, ["butterfly", key], () => butterfly(u, l, 101 + key.length));

for (const [key, name, c] of [
  ["red", "Red bow", "#e23b4b"],
  ["pink", "Pink bow", "#f7a1c4"],
  ["white", "White bow", "#f6f1ea"],
  ["gold", "Gold bow", "#e0a526"],
] as const) add(`bow-${key}`, name, ["bow", "ribbon", key], () => bow(c, 111 + key.length));

add("star-yellow", "Yellow star", ["star", "yellow"], () => starShape("#f9d94a"));
add("star-gold", "Gold star", ["star", "gold"], () => starShape("#e0a526"));
add("star-white", "White star", ["star", "white"], () => starShape("#f6f1ea"));

add("bouquet-sunflower", "Sunflower corner bouquet", ["bouquet", "corner", "sunflower", "daisy", "cluster"], cornerSunflower);
add("bouquet-daisy", "Pastel daisy bouquet", ["bouquet", "corner", "daisy", "pastel", "cluster"], cornerDaisy);
add("bouquet-rose", "Rose corner bouquet", ["bouquet", "corner", "rose", "love", "cluster"], cornerRose);
add("garland-spring", "Spring flower garland", ["garland", "border", "flowers", "strip"], garland);

// ─── Frame borders (exact canvas aspect per preset) ───────────────────────

const BORDER_COLOURS = [
  ["brown", "Velvet brown", "#5b2a1c"],
  ["pink", "Dusty pink", "#e8a1b5"],
  ["white", "Snow white", "#f3efe9"],
  ["gold", "Mustard gold", "#d9a43a"],
  ["sage", "Sage green", "#7fa874"],
  ["navy", "Navy", "#26345c"],
] as const;
const BORDER_PRESETS = SIZE_PRESETS.filter((p) => !p.key.startsWith("mug"));

// ─── Rendering ────────────────────────────────────────────────────────────

function bounds(strands: Strand[]) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const s of strands) for (const [x, y] of s.pts) {
    x1 = Math.min(x1, x - s.r * 1.3);
    y1 = Math.min(y1, y - s.r * 1.3);
    x2 = Math.max(x2, x + s.r * 1.3);
    y2 = Math.max(y2, y + s.r * 1.3);
  }
  return { x1, y1, x2, y2 };
}

/** Soft contact shadow so pieces look glued onto paper (offset down-right). */
async function withShadow(png: Buffer, w: number, h: number, dist: number) {
  const alpha = await sharp(png).extractChannel(3).raw().toBuffer();
  const dx = Math.round(dist * 0.5);
  const dy = Math.round(dist);
  // sharp runs extract before extend inside one pipeline, so shift in two steps.
  const grown = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } })
    .extend({ top: dy, left: dx, background: "#000000" })
    .extractChannel(0)
    .raw()
    .toBuffer();
  const shifted = await sharp(grown, { raw: { width: w + dx, height: h + dy, channels: 1 } })
    .extract({ left: 0, top: 0, width: w, height: h })
    .blur(Math.max(1, dist * 0.9))
    .linear(0.42, 0)
    .extractChannel(0)
    .raw()
    .toBuffer();
  const shadow = await sharp({ create: { width: w, height: h, channels: 3, background: "#2b1d12" } })
    .joinChannel(shifted, { raw: { width: w, height: h, channels: 1 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: shadow }, { input: png }])
    .png()
    .toBuffer();
}

async function renderSvg(svg: string, w: number, h: number, shadow: number, file: string, thumb: string) {
  const raster = await sharp(Buffer.from(svg)).resize(w, h).png().toBuffer();
  const art = await withShadow(raster, w, h, shadow);
  const full = await sharp(art).webp({ quality: 80, alphaQuality: 88, effort: 5 }).toBuffer();
  fs.writeFileSync(file, full);
  await sharp(full).resize(THUMB, THUMB, { fit: "inside" }).webp({ quality: 80 }).toFile(thumb);
  return full.length;
}

async function renderItem(item: Item) {
  const strands = item.draw();
  const b = bounds(strands);
  const pad = Math.max(b.x2 - b.x1, b.y2 - b.y1) * 0.04;
  const vx = b.x1 - pad, vy = b.y1 - pad, vw = b.x2 - b.x1 + pad * 2, vh = b.y2 - b.y1 + pad * 2;
  const scale = MAX / Math.max(vw, vh);
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" width="${w}" height="${h}">${renderStrands(strands, item.id.length * 97 + 13)}</svg>`;
  const bytes = await renderSvg(svg, w, h, Math.max(4, Math.round(R * scale * 0.55)), path.join(OUT, `${item.id}.webp`), path.join(OUT, "t", `${item.id}.webp`));
  return { w, h, bytes };
}

async function renderBorder(preset: (typeof BORDER_PRESETS)[number], colour: string, id: string) {
  // Rendered at 1.5× the design size so it stays crisp in print.
  const k = 1.5;
  const W = preset.width * k;
  const H = preset.height * k;
  const r = Math.min(W, H) * 0.017;
  const inset = r * 1.5;
  const strands: Strand[] = [{ pts: roundedRect(inset, inset, W - inset * 2, H - inset * 2, r * 2.2), color: colour, r, closed: true }];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${renderStrands(strands, preset.width + colour.length)}</svg>`;
  const bytes = await renderSvg(svg, Math.round(W), Math.round(H), Math.round(r * 0.6), path.join(OUT, `${id}.webp`), path.join(OUT, "t", `${id}.webp`));
  return { w: Math.round(W), h: Math.round(H), bytes };
}

async function main() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
  if (!only) fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, "t"), { recursive: true });

  const items = only ? ITEMS.filter((i) => only.includes(i.id)) : ITEMS;
  const manifest: object[] = [];
  const assets: Record<string, { src: string; w: number; h: number }> = {};
  let bytes = 0;
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      const r = await renderItem(item);
      bytes += r.bytes;
      const src = `/studio/library/chenille/${item.id}.webp`;
      assets[item.id] = { src, w: r.w, h: r.h };
      manifest.push({ id: `chenille-${item.id}`, name: item.name, group: "Pipe-cleaner flowers", tags: ["pipe cleaner", "chenille", "craft", "handmade", "fuzzy", ...item.tags], src, thumb: `/studio/library/chenille/t/${item.id}.webp`, w: r.w, h: r.h });
      console.log(`  ✓ ${item.id}`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  if (only) return console.log(`Preview rendered (${(bytes / 1024).toFixed(0)} KB) — manifest untouched.`);

  const borders: Record<string, string> = {};
  for (const preset of BORDER_PRESETS) {
    for (const [key, name, colour] of BORDER_COLOURS) {
      const id = `border-${preset.key}-${key}`;
      const r = await renderBorder(preset, colour, id);
      bytes += r.bytes;
      const src = `/studio/library/chenille/${id}.webp`;
      borders[`${preset.width}x${preset.height}-${key}`] = src;
      if (preset.key === "6x8") {
        manifest.push({ id: `chenille-${id}`, name: `${name} fuzzy border`, group: "Pipe-cleaner flowers", tags: ["pipe cleaner", "chenille", "border", "frame", key], src, thumb: `/studio/library/chenille/t/${id}.webp`, w: r.w, h: r.h });
      }
    }
    console.log(`  ✓ borders ${preset.key}`);
  }

  const order = new Map(ITEMS.map((it, i) => [`chenille-${it.id}`, i]));
  manifest.sort((a, b) => (order.get((a as { id: string }).id) ?? 999) - (order.get((b as { id: string }).id) ?? 999));
  fs.writeFileSync(path.join(OUT, "..", "manifest-chenille.json"), JSON.stringify({ version: 1, stickers: manifest }));

  const sortedAssets = Object.fromEntries(Object.entries(assets).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(
    ASSETS_TS,
    `// Generated by scripts/studio-library/pipecleaner.ts — do not edit by hand.\n\n` +
      `/** Pipe-cleaner pieces: id → file and pixel size (for aspect ratio). */\n` +
      `export const CHENILLE: Record<string, { src: string; w: number; h: number }> = ${JSON.stringify(sortedAssets, null, 2)};\n\n` +
      `/** Fuzzy frame borders keyed by "<width>x<height>-<colour>" of the canvas they fit. */\n` +
      `export const CHENILLE_BORDERS: Record<string, string> = ${JSON.stringify(borders, null, 2)};\n`,
  );
  console.log(`✓ ${ITEMS.length} pipe-cleaner pieces + ${Object.keys(borders).length} borders · ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

main();
