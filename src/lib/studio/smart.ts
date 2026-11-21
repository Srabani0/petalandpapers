/**
 * Geometry + astronomy for the Design Studio's "smart" elements. Pure
 * functions shared by the Konva editor (canvas) and the server-side preview
 * renderer (SVG), so both draw exactly the same shapes.
 */
import type { PhotoMask } from "@/lib/studio/doc";

/** The subset of CanvasRenderingContext2D that the shapes below use. */
export interface PathCtx {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
  closePath(): void;
}

/** Records PathCtx calls as an SVG path string. */
export class SvgPath implements PathCtx {
  d = "";
  private f = (v: number) => (Math.round(v * 100) / 100).toString();
  moveTo(x: number, y: number) {
    this.d += `M${this.f(x)} ${this.f(y)}`;
  }
  lineTo(x: number, y: number) {
    this.d += `L${this.f(x)} ${this.f(y)}`;
  }
  bezierCurveTo(a: number, b: number, c: number, d: number, x: number, y: number) {
    this.d += `C${this.f(a)} ${this.f(b)} ${this.f(c)} ${this.f(d)} ${this.f(x)} ${this.f(y)}`;
  }
  closePath() {
    this.d += "Z";
  }
}

const K = 0.5522847498; // cubic-bezier circle constant

function ellipsePath(ctx: PathCtx, cx: number, cy: number, rx: number, ry: number) {
  ctx.moveTo(cx + rx, cy);
  ctx.bezierCurveTo(cx + rx, cy + ry * K, cx + rx * K, cy + ry, cx, cy + ry);
  ctx.bezierCurveTo(cx - rx * K, cy + ry, cx - rx, cy + ry * K, cx - rx, cy);
  ctx.bezierCurveTo(cx - rx, cy - ry * K, cx - rx * K, cy - ry, cx, cy - ry);
  ctx.bezierCurveTo(cx + rx * K, cy - ry, cx + rx, cy - ry * K, cx + rx, cy);
  ctx.closePath();
}

function roundRectPath(ctx: PathCtx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const k = rr * (1 - K);
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.bezierCurveTo(x + w - k, y, x + w, y + k, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.bezierCurveTo(x + w, y + h - k, x + w - k, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.bezierCurveTo(x + k, y + h, x, y + h - k, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.bezierCurveTo(x, y + k, x + k, y, x + rr, y);
  ctx.closePath();
}

/** Traces a photo-frame shape filling the box (x, y, w, h). `radius` only applies to "rect". */
export function tracePhotoMask(ctx: PathCtx, mask: PhotoMask | undefined, x: number, y: number, w: number, h: number, radius = 0) {
  switch (mask ?? "rect") {
    case "circle":
      return ellipsePath(ctx, x + w / 2, y + h / 2, w / 2, h / 2);
    case "heart": {
      // Normalised heart (0…1), drawn as smooth beziers.
      const P = (px: number, py: number): [number, number] => [x + px * w, y + py * h];
      const m = P(0.5, 0.18);
      ctx.moveTo(...m);
      ctx.bezierCurveTo(...P(0.5, 0.14), ...P(0.42, 0), ...P(0.25, 0));
      ctx.bezierCurveTo(...P(0.02, 0), ...P(0, 0.22), ...P(0, 0.34));
      ctx.bezierCurveTo(...P(0, 0.58), ...P(0.22, 0.78), ...P(0.5, 1));
      ctx.bezierCurveTo(...P(0.78, 0.78), ...P(1, 0.58), ...P(1, 0.34));
      ctx.bezierCurveTo(...P(1, 0.22), ...P(0.98, 0), ...P(0.75, 0));
      ctx.bezierCurveTo(...P(0.58, 0), ...P(0.5, 0.14), ...m);
      ctx.closePath();
      return;
    }
    case "star": {
      const cx = x + w / 2;
      const cy = y + h / 2 + h * 0.04;
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 1 : 0.48;
        const px = cx + Math.cos(a) * (w / 2) * r;
        const py = cy + Math.sin(a) * (h / 2) * r * 1.05;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      return;
    }
    case "arch": {
      const r = Math.min(w / 2, h);
      const k = r * K;
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.bezierCurveTo(x, y + r - k, x + r - k, y, x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.bezierCurveTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      return;
    }
    case "hexagon": {
      const pts: [number, number][] = [
        [0.5, 0],
        [1, 0.25],
        [1, 0.75],
        [0.5, 1],
        [0, 0.75],
        [0, 0.25],
      ];
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(x + px * w, y + py * h) : ctx.moveTo(x + px * w, y + py * h)));
      ctx.closePath();
      return;
    }
    default:
      return roundRectPath(ctx, x, y, w, h, radius);
  }
}

// ─── Curved text ──────────────────────────────────────────────────────────

/**
 * Arc path for curved text of the given box width (= arc length) and size.
 * Positive curve arches upwards, negative smiles. Returns the SVG path and
 * the box height the text needs.
 */
/** Point + tangent angle at distance `s` along the curved-text arc (same geometry as curvedTextPath). */
export function curvedTextPoint(width: number, fontSize: number, curve: number, dist: number) {
  const theta = (Math.min(100, Math.abs(curve)) / 100) * Math.PI * 1.6;
  const { d } = curvedTextPath(width, fontSize, curve);
  const m = d.match(/^M([d.-]+) ([d.-]+)/);
  const sx = m ? Number(m[1]) : 0;
  const sy = m ? Number(m[2]) : fontSize;
  if (theta < 0.01) return { x: sx + dist, y: sy, angle: 0 };
  const R = width / theta;
  const up = curve > 0;
  const start = up ? -Math.PI / 2 - theta / 2 : Math.PI / 2 + theta / 2;
  const dir = up ? 1 : -1;
  const a = start + (dir * dist) / R;
  // Centre of the circle, from the start point.
  const cx = sx - Math.cos(start) * R;
  const cy = sy - Math.sin(start) * R;
  return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, angle: ((a + (dir * Math.PI) / 2) * 180) / Math.PI };
}

export function curvedTextPath(width: number, fontSize: number, curve: number) {
  const theta = (Math.min(100, Math.abs(curve)) / 100) * Math.PI * 1.6;
  if (theta < 0.01) return { d: `M0 ${fontSize}L${width} ${fontSize}`, height: fontSize * 1.3 };
  const R = width / theta;
  const up = curve > 0;
  // Arch: travel left→right over the top. Smile: left→right along the bottom.
  const start = up ? -Math.PI / 2 - theta / 2 : Math.PI / 2 + theta / 2;
  const dir = up ? 1 : -1;
  const pts: [number, number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const a = start + dir * (theta * i) / 48;
    const px = Math.cos(a) * R;
    const py = Math.sin(a) * R;
    // Glyphs stand on the side away from the centre for arches, towards it for smiles.
    const nx = up ? Math.cos(a) : -Math.cos(a);
    const ny = up ? Math.sin(a) : -Math.sin(a);
    pts.push([px, py, nx, ny]);
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [px, py, nx, ny] of pts) {
    for (const t of [-0.25, 0.95]) {
      minX = Math.min(minX, px + nx * fontSize * t);
      maxX = Math.max(maxX, px + nx * fontSize * t);
      minY = Math.min(minY, py + ny * fontSize * t);
      maxY = Math.max(maxY, py + ny * fontSize * t);
    }
  }
  const ox = width / 2 - (minX + maxX) / 2;
  const oy = -minY;
  const f = (v: number) => (Math.round(v * 100) / 100).toString();
  const [sx, sy] = pts[0];
  const [ex, ey] = pts[pts.length - 1];
  const d = `M${f(sx + ox)} ${f(sy + oy)}A${f(R)} ${f(R)} 0 ${theta > Math.PI ? 1 : 0} ${up ? 1 : 0} ${f(ex + ox)} ${f(ey + oy)}`;
  return { d, height: Math.max(fontSize, maxY - minY) };
}

// ─── Astronomy ────────────────────────────────────────────────────────────

const RAD = Math.PI / 180;

/** UTC milliseconds for a "YYYY-MM-DDTHH:mm" local time at the given offset. */
export function localToUtcMs(local: string, utcOffsetMin: number) {
  const [d, t] = local.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return Date.UTC(y, mo - 1, da, h, mi) - utcOffsetMin * 60000;
}

const julianDay = (utcMs: number) => utcMs / 86400000 + 2440587.5;

/** Moon phase: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
export function moonPhase(local: string, utcOffsetMin = 330) {
  const SYNODIC = 29.530588853;
  const age = (((julianDay(localToUtcMs(local, utcOffsetMin)) - 2451550.1) % SYNODIC) + SYNODIC) % SYNODIC;
  const phase = age / SYNODIC;
  return { phase, illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2, ageDays: age };
}

export function moonPhaseName(phase: number) {
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  return names[Math.round(phase * 8) % 8];
}

/** Traces the lit part of a moon disc of radius r centred at (cx, cy). */
export function traceMoonLit(ctx: PathCtx, cx: number, cy: number, r: number, phase: number) {
  const waxing = phase < 0.5;
  const side = waxing ? 1 : -1; // lit limb: right while waxing (northern-hemisphere view)
  const tx = r * Math.cos(2 * Math.PI * phase) * side; // terminator half-width (signed)
  // Lit limb: top → bottom around the lit side.
  ctx.moveTo(cx, cy - r);
  ctx.bezierCurveTo(cx + side * r * K, cy - r, cx + side * r, cy - r * K, cx + side * r, cy);
  ctx.bezierCurveTo(cx + side * r, cy + r * K, cx + side * r * K, cy + r, cx, cy + r);
  // Terminator: bottom → top (a half-ellipse, bulging towards or away from the limb).
  ctx.bezierCurveTo(cx + tx * K, cy + r, cx + tx, cy + r * K, cx + tx, cy);
  ctx.bezierCurveTo(cx + tx, cy - r * K, cx + tx * K, cy - r, cx, cy - r);
  ctx.closePath();
}

export interface SkyPoint {
  x: number; // -1…1, 0 = zenith; horizon is the unit circle
  y: number;
  mag: number;
}

/** Local sidereal time in degrees. */
function lstDeg(utcMs: number, lon: number) {
  const gmst = 280.46061837 + 360.98564736629 * (julianDay(utcMs) - 2451545.0);
  return (((gmst + lon) % 360) + 360) % 360;
}

/**
 * Projects a J2000 RA/Dec onto the sky seen from (lat, lon) at a moment:
 * stereographic, zenith at the centre, north up, east on the left (as when
 * looking up). Returns null below the horizon.
 */
function project(raDeg: number, decDeg: number, lst: number, lat: number): { x: number; y: number } | null {
  const H = (lst - raDeg) * RAD;
  const dec = decDeg * RAD;
  const phi = lat * RAD;
  const sinAlt = Math.sin(dec) * Math.sin(phi) + Math.cos(dec) * Math.cos(phi) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  if (alt < -0.02) return null;
  const az = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.sin(dec) * Math.cos(phi) - Math.cos(dec) * Math.sin(phi) * Math.cos(H));
  const r = Math.min(1, Math.tan((Math.PI / 2 - alt) / 2));
  return { x: -r * Math.sin(az), y: -r * Math.cos(az) };
}

export function skyAt(
  stars: readonly number[],
  lines: readonly (readonly number[])[],
  local: string,
  utcOffsetMin: number,
  lat: number,
  lon: number,
) {
  const lst = lstDeg(localToUtcMs(local, utcOffsetMin), lon);
  const points: SkyPoint[] = [];
  for (let i = 0; i < stars.length; i += 3) {
    const p = project(stars[i], stars[i + 1], lst, lat);
    if (p) points.push({ ...p, mag: stars[i + 2] });
  }
  const segments: [number, number, number, number][] = [];
  for (const line of lines) {
    let prev: { x: number; y: number } | null = null;
    for (let i = 0; i < line.length; i += 2) {
      const p = project(line[i], line[i + 1], lst, lat);
      if (p && prev) segments.push([prev.x, prev.y, p.x, p.y]);
      prev = p;
    }
  }
  return { points, segments };
}

/** Star dot radius (as a fraction of the chart radius) for a visual magnitude. */
export const starRadius = (mag: number) => 0.0035 + Math.max(0, 5.6 - mag) ** 1.55 * 0.0021;

// ─── Places for the star map ──────────────────────────────────────────────

export interface Place {
  name: string;
  lat: number;
  lon: number;
  /** Standard UTC offset in minutes. */
  tz: number;
}

export const PLACES: Place[] = [
  { name: "New Delhi, India", lat: 28.6139, lon: 77.209, tz: 330 },
  { name: "Mumbai, India", lat: 19.076, lon: 72.8777, tz: 330 },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, tz: 330 },
  { name: "Chennai, India", lat: 13.0827, lon: 80.2707, tz: 330 },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: 330 },
  { name: "Hyderabad, India", lat: 17.385, lon: 78.4867, tz: 330 },
  { name: "Pune, India", lat: 18.5204, lon: 73.8567, tz: 330 },
  { name: "Ahmedabad, India", lat: 23.0225, lon: 72.5714, tz: 330 },
  { name: "Jaipur, India", lat: 26.9124, lon: 75.7873, tz: 330 },
  { name: "Lucknow, India", lat: 26.8467, lon: 80.9462, tz: 330 },
  { name: "Kanpur, India", lat: 26.4499, lon: 80.3319, tz: 330 },
  { name: "Patna, India", lat: 25.5941, lon: 85.1376, tz: 330 },
  { name: "Bhubaneswar, India", lat: 20.2961, lon: 85.8245, tz: 330 },
  { name: "Cuttack, India", lat: 20.4625, lon: 85.8828, tz: 330 },
  { name: "Puri, India", lat: 19.8135, lon: 85.8312, tz: 330 },
  { name: "Rourkela, India", lat: 22.2604, lon: 84.8536, tz: 330 },
  { name: "Sambalpur, India", lat: 21.4669, lon: 83.9812, tz: 330 },
  { name: "Berhampur, India", lat: 19.3149, lon: 84.7941, tz: 330 },
  { name: "Ranchi, India", lat: 23.3441, lon: 85.3096, tz: 330 },
  { name: "Jamshedpur, India", lat: 22.8046, lon: 86.2029, tz: 330 },
  { name: "Raipur, India", lat: 21.2514, lon: 81.6296, tz: 330 },
  { name: "Visakhapatnam, India", lat: 17.6868, lon: 83.2185, tz: 330 },
  { name: "Vijayawada, India", lat: 16.5062, lon: 80.648, tz: 330 },
  { name: "Guwahati, India", lat: 26.1445, lon: 91.7362, tz: 330 },
  { name: "Shillong, India", lat: 25.5788, lon: 91.8933, tz: 330 },
  { name: "Siliguri, India", lat: 26.7271, lon: 88.3953, tz: 330 },
  { name: "Darjeeling, India", lat: 27.041, lon: 88.2663, tz: 330 },
  { name: "Gangtok, India", lat: 27.3389, lon: 88.6065, tz: 330 },
  { name: "Chandigarh, India", lat: 30.7333, lon: 76.7794, tz: 330 },
  { name: "Amritsar, India", lat: 31.634, lon: 74.8723, tz: 330 },
  { name: "Ludhiana, India", lat: 30.901, lon: 75.8573, tz: 330 },
  { name: "Dehradun, India", lat: 30.3165, lon: 78.0322, tz: 330 },
  { name: "Shimla, India", lat: 31.1048, lon: 77.1734, tz: 330 },
  { name: "Srinagar, India", lat: 34.0837, lon: 74.7973, tz: 330 },
  { name: "Jammu, India", lat: 32.7266, lon: 74.857, tz: 330 },
  { name: "Varanasi, India", lat: 25.3176, lon: 82.9739, tz: 330 },
  { name: "Prayagraj, India", lat: 25.4358, lon: 81.8463, tz: 330 },
  { name: "Agra, India", lat: 27.1767, lon: 78.0081, tz: 330 },
  { name: "Noida, India", lat: 28.5355, lon: 77.391, tz: 330 },
  { name: "Gurugram, India", lat: 28.4595, lon: 77.0266, tz: 330 },
  { name: "Indore, India", lat: 22.7196, lon: 75.8577, tz: 330 },
  { name: "Bhopal, India", lat: 23.2599, lon: 77.4126, tz: 330 },
  { name: "Nagpur, India", lat: 21.1458, lon: 79.0882, tz: 330 },
  { name: "Surat, India", lat: 21.1702, lon: 72.8311, tz: 330 },
  { name: "Vadodara, India", lat: 22.3072, lon: 73.1812, tz: 330 },
  { name: "Udaipur, India", lat: 24.5854, lon: 73.7125, tz: 330 },
  { name: "Jodhpur, India", lat: 26.2389, lon: 73.0243, tz: 330 },
  { name: "Goa, India", lat: 15.2993, lon: 74.124, tz: 330 },
  { name: "Mangaluru, India", lat: 12.9141, lon: 74.856, tz: 330 },
  { name: "Mysuru, India", lat: 12.2958, lon: 76.6394, tz: 330 },
  { name: "Kochi, India", lat: 9.9312, lon: 76.2673, tz: 330 },
  { name: "Thiruvananthapuram, India", lat: 8.5241, lon: 76.9366, tz: 330 },
  { name: "Coimbatore, India", lat: 11.0168, lon: 76.9558, tz: 330 },
  { name: "Madurai, India", lat: 9.9252, lon: 78.1198, tz: 330 },
  { name: "Puducherry, India", lat: 11.9416, lon: 79.8083, tz: 330 },
  { name: "Port Blair, India", lat: 11.6234, lon: 92.7265, tz: 330 },
  { name: "Kathmandu, Nepal", lat: 27.7172, lon: 85.324, tz: 345 },
  { name: "Dhaka, Bangladesh", lat: 23.8103, lon: 90.4125, tz: 360 },
  { name: "Colombo, Sri Lanka", lat: 6.9271, lon: 79.8612, tz: 330 },
  { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, tz: 240 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 480 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522, tz: 60 },
  { name: "New York, USA", lat: 40.7128, lon: -74.006, tz: -300 },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194, tz: -480 },
  { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832, tz: -300 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, tz: 600 },
  { name: "Melbourne, Australia", lat: -37.8136, lon: 144.9631, tz: 600 },
  { name: "Auckland, New Zealand", lat: -36.8485, lon: 174.7633, tz: 720 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, tz: 540 },
];
