/**
 * Pipe-cleaner ("chenille") craft rendering for the Design Studio.
 *
 * A pipe cleaner is a wire with fibres sticking out all around it. We draw a
 * centre line (the wire) and scatter thousands of short fibres around it:
 * each fibre points in a random direction around the wire, is projected to
 * 2D, and is shaded by how it faces a light in the top-left. Fibres behind
 * the wire are drawn first and darker, fibres in front last and lighter —
 * which gives the soft, round, fuzzy look of the real thing.
 *
 * Shapes (petal loops, coils, springs…) are built from the same strands the
 * way they're bent by hand, so the stickers look like real handmade flowers.
 */
import { rng } from "./kit";

export type Pt = [number, number];

export interface Strand {
  pts: Pt[];
  color: string;
  /** Fibre radius (half the pipe cleaner's thickness), in px. */
  r: number;
  closed?: boolean;
  /** 0–1: darken (used for the back half of springs). */
  dim?: number;
}

// ─── Colour helpers ───────────────────────────────────────────────────────

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
const toHex = (c: RGB) => "#" + c.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const SHADES = 9;
/** Dark → base → light ramp for one fibre colour. */
function ramp(base: string, dim = 0): string[] {
  const b = hex(base);
  const dark = mix(b, [20, 12, 8], 0.55);
  const light = mix(b, [255, 255, 255], 0.5);
  return Array.from({ length: SHADES }, (_, i) => {
    const t = i / (SHADES - 1);
    const c = t < 0.55 ? mix(dark, b, t / 0.55) : mix(b, light, (t - 0.55) / 0.45);
    return toHex(dim ? mix(c, [20, 12, 8], dim) : c);
  });
}

// ─── Geometry ─────────────────────────────────────────────────────────────

/** Resamples a polyline at a fixed spacing. */
function resample(pts: Pt[], step: number, closed = false): Pt[] {
  const src = closed ? [...pts, pts[0]] : pts;
  const out: Pt[] = [src[0]];
  let carry = 0;
  for (let i = 1; i < src.length; i++) {
    const [x0, y0] = src[i - 1];
    const [x1, y1] = src[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    let d = step - carry;
    while (d <= len) {
      const t = d / len;
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
      d += step;
    }
    carry = len - (d - step);
  }
  return out;
}

const LIGHT: Pt = (() => {
  const l = Math.hypot(-0.55, -0.85);
  return [-0.55 / l, -0.85 / l];
})();

/** SVG for a list of strands, painted in order. */
export function renderStrands(strands: Strand[], seed: number): string {
  const rand = rng(seed);
  let out = "";
  for (const s of strands) {
    const shades = ramp(s.color, s.dim);
    const pts = resample(s.pts, Math.max(0.6, s.r * 0.11), s.closed);
    if (pts.length < 2) continue;
    const back: string[][] = Array.from({ length: SHADES }, () => []);
    const front: string[][] = Array.from({ length: SHADES }, () => []);
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 2)];
      const b = pts[Math.min(n - 1, i + 2)];
      let tx = b[0] - a[0];
      let ty = b[1] - a[1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const nx = -ty;
      const ny = tx;
      const facing = nx * LIGHT[0] + ny * LIGHT[1];
      for (let k = 0; k < 4; k++) {
        const phi = rand() * Math.PI * 2;
        const c = Math.cos(phi);
        const sn = Math.sin(phi);
        const L = s.r * (0.72 + rand() * 0.5);
        const slant = (rand() - 0.5) * s.r * 0.55;
        const [px, py] = pts[i];
        const sx = px + nx * c * L * 0.12;
        const sy = py + ny * c * L * 0.12;
        const ex = px + nx * c * L + tx * slant;
        const ey = py + ny * c * L + ty * slant;
        // Lambert-ish shading: fibres on the lit side and facing the viewer are bright.
        let lum = 0.42 + 0.38 * facing * c + 0.32 * sn + (rand() - 0.5) * 0.28;
        if (sn < 0) lum -= 0.18;
        const bucket = Math.max(0, Math.min(SHADES - 1, Math.round(lum * (SHADES - 1))));
        (sn < 0 ? back : front)[bucket].push(`M${sx.toFixed(1)} ${sy.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`);
      }
    }
    const w = Math.max(0.7, s.r * 0.13).toFixed(2);
    const core = resample(s.pts, Math.max(2, s.r * 0.5), s.closed);
    const coreD = core.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("") + (s.closed ? "Z" : "");
    const paint = (layer: string[][], opacity: number) =>
      layer
        .map((d, i) => (d.length ? `<path d="${d.join("")}" stroke="${shades[i]}" stroke-width="${w}" stroke-linecap="round" stroke-opacity="${opacity}" fill="none"/>` : ""))
        .join("");
    out += `<g>${paint(back, 0.95)}<path d="${coreD}" stroke="${shades[2]}" stroke-width="${(s.r * 1.25).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/>${paint(front, 0.92)}</g>`;
  }
  return out;
}

// ─── Hand-bent shapes ─────────────────────────────────────────────────────

const rot = (x: number, y: number, a: number): Pt => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

/**
 * One petal loop: the wire goes out from the centre and comes back.
 * `shape` "round" bulges near the tip, "pointy" makes a leaf/tulip point.
 */
export function petalLoop(cx: number, cy: number, angle: number, len: number, halfW: number, opts: { base?: number; shape?: "round" | "pointy" | "oval"; wobble?: number; seed?: number } = {}): Pt[] {
  const { base = 0, shape = "round", wobble = 0, seed = 1 } = opts;
  const rand = rng(seed);
  const wob = [rand() * 6, rand() * 6];
  const pts: Pt[] = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const along = base + len * (1 - Math.cos(t)) / 2;
    const s = Math.sin(t);
    const across =
      shape === "pointy" ? halfW * Math.sign(s) * Math.abs(s) ** 1.5 : shape === "oval" ? halfW * s : halfW * s * Math.sqrt((1 - Math.cos(t)) / 2) * 1.25;
    const w = 1 + wobble * Math.sin(t * 2 + wob[0]) * 0.5 + wobble * Math.sin(t * 3 + wob[1]) * 0.3;
    const [x, y] = rot(along, across * w, angle);
    pts.push([cx + x, cy + y]);
  }
  return pts;
}

/** A petal loop with smaller loops inside, so it reads as a filled, fluffy petal. */
export function filledPetal(cx: number, cy: number, angle: number, len: number, halfW: number, r: number, opts: Parameters<typeof petalLoop>[5] = {}): Pt[][] {
  const loops: Pt[][] = [petalLoop(cx, cy, angle, len, halfW, opts)];
  let w = halfW - r * 1.3;
  let l = len - r * 0.9;
  let k = 1;
  while (w > r * 0.5 && l > r) {
    loops.push(petalLoop(cx, cy, angle, l, w, { ...opts, base: (opts.base ?? 0) + r * 0.5 * k, seed: (opts.seed ?? 1) + k }));
    w -= r * 1.3;
    l -= r * 1.2;
    k++;
  }
  // The wire's own middle run fills whatever slit is left in the centre.
  const base = opts.base ?? 0;
  const mid: Pt[] = [];
  for (let i = 0; i <= 20; i++) {
    const [x, y] = rot(base + r * 0.6 + ((len - r * 2.2) * i) / 20, 0, angle);
    mid.push([cx + x, cy + y]);
  }
  loops.push(mid);
  return loops;
}

/** Flat coiled spiral (flower centres, rosettes). */
export function coil(cx: number, cy: number, radius: number, spacing: number, opts: { wobble?: number; seed?: number; squash?: number } = {}): Pt[] {
  const { wobble = 0, seed = 1, squash = 1 } = opts;
  const rand = rng(seed);
  const ph = rand() * 6;
  const pts: Pt[] = [];
  const turns = radius / spacing;
  const total = turns * Math.PI * 2;
  for (let th = 0.6; th <= total; th += 0.08) {
    const r = (spacing * th) / (Math.PI * 2);
    const w = 1 + wobble * Math.sin(th * 2.5 + ph) * 0.12;
    pts.push([cx + Math.cos(th) * r * w, cy + Math.sin(th) * r * w * squash]);
  }
  return pts;
}

/** A side-on spring (the curly pipe-cleaner coil), split into back/front runs. */
export function spring(x0: number, y0: number, x1: number, y1: number, amp: number, turns: number, color: string, r: number): Strand[] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const runs: { back: boolean; pts: Pt[] }[] = [];
  const total = turns * Math.PI * 2;
  for (let th = 0; th <= total; th += 0.05) {
    const along = (th / total) * len + Math.cos(th) * amp * 0.38; // ellipse tilt → visible loops
    const across = Math.sin(th) * amp;
    const back = Math.cos(th) < 0;
    const p: Pt = [x0 + ux * along + nx * across, y0 + uy * along + ny * across];
    const last = runs[runs.length - 1];
    if (!last || last.back !== back) {
      if (last) last.pts.push(p);
      runs.push({ back, pts: last ? [last.pts[last.pts.length - 2] ?? p, p] : [p] });
    } else last.pts.push(p);
  }
  return [
    ...runs.filter((r) => r.back).map((run) => ({ pts: run.pts, color, r: r * 0.95, dim: 0.28 })),
    ...runs.filter((r) => !r.back).map((run) => ({ pts: run.pts, color, r })),
  ];
}

/** Gently curved stem from a to b (quadratic bend). */
export function stem(a: Pt, b: Pt, bend: number): Pt[] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const c: Pt = [mx - (dy / len) * bend, my + (dx / len) * bend];
  const pts: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
  }
  return pts;
}

/** Classic heart outline. */
export function heart(cx: number, cy: number, size: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push([cx + (x / 17) * size, cy + (y / 17) * size]);
  }
  return pts;
}

/** Five-point star outline with softened points. */
export function star(cx: number, cy: number, R: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * Math.PI * 2 - Math.PI / 2;
    const k = (Math.cos(5 * (t + Math.PI / 2)) + 1) / 2; // 1 at points, 0 between
    const r = R * (0.48 + 0.52 * k ** 1.6);
    pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
  }
  return pts;
}

/** Rounded rectangle outline (frame borders). */
export function roundedRect(x: number, y: number, w: number, h: number, rad: number): Pt[] {
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 10; i++) {
      const a = a0 + (i / 10) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
  };
  corner(x + w - rad, y + rad, -Math.PI / 2);
  corner(x + w - rad, y + h - rad, 0);
  corner(x + rad, y + h - rad, Math.PI / 2);
  corner(x + rad, y + rad, Math.PI);
  return pts;
}
