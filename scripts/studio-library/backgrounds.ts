/**
 * Textured, Pinterest-style backgrounds (1400 × 1400, used with cover-fit).
 * Every one gets a faint paper grain so it reads as printed paper, not a
 * flat digital fill.
 */
import { WHITE, rng, type Palette } from "./kit";

export const BG_SIZE = 1400;
const S = BG_SIZE;

const HEART = "M100 172 C40 130 12 98 16 64 C20 34 46 18 70 22 C86 25 96 36 100 46 C104 36 114 25 130 22 C154 18 180 34 184 64 C188 98 160 130 100 172 Z";
const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 ? r : R;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
const flower = (x: number, y: number, r: number, petal: string, centre: string) =>
  `${Array.from({ length: 5 }, (_, i) => `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.55}" ry="${r * 0.75}" fill="${petal}" transform="rotate(${i * 72} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${centre}"/>`;

const pattern = (id: string, w: number, h: number, body: string, extra = "") =>
  `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" ${extra}>${body}</pattern>`;

export interface BackgroundDef {
  id: string;
  name: string;
  group: string;
  tags: string[];
  draw: (p: Palette, seed: number) => { defs?: string; body: string };
}

export const BACKGROUNDS: BackgroundDef[] = [
  { id: "gingham", name: "Gingham", group: "Checks & plaids", tags: ["gingham", "picnic", "check"],
    draw: (p) => ({ defs: pattern("g", 90, 90, `<rect width="90" height="90" fill="${p.light}"/><rect width="45" height="90" fill="${p.accent}" opacity=".32"/><rect width="90" height="45" fill="${p.accent}" opacity=".32"/>`), body: `<rect width="${S}" height="${S}" fill="url(#g)"/>` }) },
  { id: "checker", name: "Checkerboard", group: "Checks & plaids", tags: ["checker", "retro", "y2k"],
    draw: (p) => ({ defs: pattern("c", 160, 160, `<rect width="160" height="160" fill="${p.light}"/><rect width="80" height="80" fill="${p.main}"/><rect x="80" y="80" width="80" height="80" fill="${p.main}"/>`), body: `<rect width="${S}" height="${S}" fill="url(#c)"/>` }) },
  { id: "plaid", name: "Plaid", group: "Checks & plaids", tags: ["plaid", "tartan", "cozy"],
    draw: (p) => ({ defs: pattern("pl", 220, 220, `<rect width="220" height="220" fill="${p.light}"/><rect x="20" width="70" height="220" fill="${p.main}" opacity=".7"/><rect y="20" width="220" height="70" fill="${p.main}" opacity=".7"/><rect x="130" width="14" height="220" fill="${p.accent}" opacity=".55"/><rect y="130" width="220" height="14" fill="${p.accent}" opacity=".55"/><rect x="180" width="4" height="220" fill="${p.dark}" opacity=".35"/><rect y="180" width="220" height="4" fill="${p.dark}" opacity=".35"/>`), body: `<rect width="${S}" height="${S}" fill="url(#pl)"/>` }) },
  { id: "polka", name: "Polka dots", group: "Dots & stripes", tags: ["polka", "dots", "cute"],
    draw: (p) => ({ defs: pattern("d", 70, 70, `<rect width="70" height="70" fill="${p.light}"/><circle cx="17" cy="17" r="8" fill="${p.accent}" opacity=".75"/><circle cx="52" cy="52" r="8" fill="${p.accent}" opacity=".75"/>`), body: `<rect width="${S}" height="${S}" fill="url(#d)"/>` }) },
  { id: "polka-big", name: "Big dots", group: "Dots & stripes", tags: ["polka", "dots", "bold"],
    draw: (p) => ({ defs: pattern("d", 220, 220, `<rect width="220" height="220" fill="${p.main}"/><circle cx="55" cy="55" r="30" fill="${p.light}"/><circle cx="165" cy="165" r="30" fill="${p.light}"/>`), body: `<rect width="${S}" height="${S}" fill="url(#d)"/>` }) },
  { id: "stripes", name: "Candy stripes", group: "Dots & stripes", tags: ["stripes", "cabana"],
    draw: (p) => ({ defs: pattern("s", 120, 120, `<rect width="120" height="120" fill="${p.light}"/><rect width="60" height="120" fill="${p.main}"/>`), body: `<rect width="${S}" height="${S}" fill="url(#s)"/>` }) },
  { id: "diagonal", name: "Diagonal stripes", group: "Dots & stripes", tags: ["stripes", "diagonal"],
    draw: (p) => ({ defs: pattern("s", 70, 70, `<rect width="70" height="70" fill="${p.light}"/><rect width="26" height="70" fill="${p.main}"/>`, 'patternTransform="rotate(45)"'), body: `<rect width="${S}" height="${S}" fill="url(#s)"/>` }) },
  { id: "waves", name: "Retro waves", group: "Dots & stripes", tags: ["wavy", "retro", "70s"],
    draw: (p) => ({ defs: pattern("w", 200, 90, `<rect width="200" height="90" fill="${p.light}"/><path d="M0 45 Q50 10 100 45 T200 45" stroke="${p.accent}" stroke-width="18" fill="none" stroke-linecap="round"/>`), body: `<rect width="${S}" height="${S}" fill="url(#w)"/>` }) },
  { id: "grid", name: "Grid paper", group: "Paper & journal", tags: ["grid", "paper", "journal"],
    draw: (p) => ({ defs: pattern("gr", 56, 56, `<rect width="56" height="56" fill="${p.light}"/><path d="M56 0 H0 V56" fill="none" stroke="${p.accent}" stroke-width="2" opacity=".35"/>`), body: `<rect width="${S}" height="${S}" fill="url(#gr)"/>` }) },
  { id: "dot-grid", name: "Dotted journal", group: "Paper & journal", tags: ["bullet journal", "dots", "paper"],
    draw: (p) => ({ defs: pattern("dg", 50, 50, `<rect width="50" height="50" fill="${p.light}"/><circle cx="25" cy="25" r="3" fill="${p.accent}" opacity=".55"/>`), body: `<rect width="${S}" height="${S}" fill="url(#dg)"/>` }) },
  { id: "lined", name: "Notebook paper", group: "Paper & journal", tags: ["notebook", "lined", "school"],
    draw: (p) => ({ defs: pattern("l", S, 60, `<rect width="${S}" height="60" fill="${WHITE}"/><line x1="0" y1="59" x2="${S}" y2="59" stroke="${p.accent}" stroke-width="2.5" opacity=".55"/>`), body: `<rect width="${S}" height="${S}" fill="url(#l)"/><line x1="170" y1="0" x2="170" y2="${S}" stroke="#ef8f8f" stroke-width="4"/>` }) },
  { id: "paper", name: "Tinted paper", group: "Paper & journal", tags: ["paper", "texture", "minimal"],
    draw: (p) => ({ defs: `<filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .22"/></feComponentTransfer></filter>`, body: `<rect width="${S}" height="${S}" fill="${p.main}"/><rect width="${S}" height="${S}" filter="url(#f)"/>` }) },
  { id: "linen", name: "Linen", group: "Paper & journal", tags: ["linen", "fabric", "texture"],
    draw: (p) => ({ defs: pattern("ln", 8, 8, `<rect width="8" height="8" fill="${p.light}"/><rect width="8" height="2" fill="${p.main}" opacity=".5"/><rect width="2" height="8" fill="${p.main}" opacity=".35"/>`), body: `<rect width="${S}" height="${S}" fill="url(#ln)"/>` }) },
  { id: "watercolor", name: "Watercolour wash", group: "Soft & dreamy", tags: ["watercolor", "soft", "dreamy"],
    draw: (p, seed) => { const r = rng(seed); return { defs: `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter>`, body: `<rect width="${S}" height="${S}" fill="${p.light}"/><g filter="url(#b)" opacity=".85">${[p.main, p.accent, p.pop, p.main, p.main].map((c) => `<ellipse cx="${(r() * S).toFixed(0)}" cy="${(r() * S).toFixed(0)}" rx="${(260 + r() * 260).toFixed(0)}" ry="${(200 + r() * 220).toFixed(0)}" fill="${c}" opacity="${(0.45 + r() * 0.35).toFixed(2)}"/>`).join("")}</g>` }; } },
  { id: "gradient", name: "Pastel gradient", group: "Soft & dreamy", tags: ["gradient", "ombre", "minimal"],
    draw: (p) => ({ defs: `<linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.light}"/><stop offset=".55" stop-color="${p.main}"/><stop offset="1" stop-color="${p.pop}" stop-opacity=".8"/></linearGradient>`, body: `<rect width="${S}" height="${S}" fill="url(#gr)"/>` }) },
  { id: "bokeh", name: "Bokeh", group: "Soft & dreamy", tags: ["bokeh", "glow", "dreamy"],
    draw: (p, seed) => { const r = rng(seed); return { defs: `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>`, body: `<rect width="${S}" height="${S}" fill="${p.main}"/><g filter="url(#b)">${Array.from({ length: 34 }, () => `<circle cx="${(r() * S).toFixed(0)}" cy="${(r() * S).toFixed(0)}" r="${(30 + r() * 90).toFixed(0)}" fill="${WHITE}" opacity="${(0.18 + r() * 0.35).toFixed(2)}"/>`).join("")}</g>` }; } },
  { id: "clouds", name: "Cloudy sky", group: "Soft & dreamy", tags: ["clouds", "sky", "dreamy"],
    draw: (p, seed) => { const r = rng(seed); return { defs: `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.main}"/><stop offset="1" stop-color="${p.light}"/></linearGradient>`, body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>${Array.from({ length: 9 }, () => { const x = r() * S; const y = r() * S; const s = 0.8 + r() * 1.4; return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})" fill="${WHITE}" opacity=".9"><circle cx="0" cy="0" r="40"/><circle cx="46" cy="-18" r="52"/><circle cx="100" cy="0" r="42"/><rect x="0" y="0" width="100" height="40" rx="20"/></g>`; }).join("")}` }; } },
  { id: "hearts", name: "Little hearts", group: "Cute prints", tags: ["hearts", "love", "valentine"],
    draw: (p) => ({ defs: pattern("h", 140, 140, `<rect width="140" height="140" fill="${p.light}"/><path d="${HEART}" fill="${p.accent}" transform="translate(35 35) scale(.16) translate(-100 -96)"/><path d="${HEART}" fill="${p.main}" transform="translate(105 105) scale(.16) translate(-100 -96)"/>`), body: `<rect width="${S}" height="${S}" fill="url(#h)"/>` }) },
  { id: "stars", name: "Starry", group: "Cute prints", tags: ["stars", "night", "magic"],
    draw: (p) => ({ defs: pattern("st", 180, 180, `<rect width="180" height="180" fill="${p.main}"/><polygon points="${starPts(45, 50, 18, 8)}" fill="${WHITE}" opacity=".85"/><polygon points="${starPts(130, 125, 12, 5)}" fill="${p.light}"/><circle cx="140" cy="40" r="4" fill="${WHITE}"/><circle cx="50" cy="140" r="3" fill="${WHITE}"/>`), body: `<rect width="${S}" height="${S}" fill="url(#st)"/>` }) },
  { id: "ditsy", name: "Ditsy floral", group: "Cute prints", tags: ["floral", "flowers", "cottagecore"],
    draw: (p) => ({ defs: pattern("f", 200, 200, `<rect width="200" height="200" fill="${p.light}"/>${flower(50, 50, 18, p.accent, p.pop)}${flower(150, 140, 15, p.main, p.accent)}${flower(140, 40, 9, p.pop, WHITE)}<ellipse cx="80" cy="150" rx="14" ry="6" fill="#a7c896" transform="rotate(-30 80 150)"/><ellipse cx="96" cy="82" rx="12" ry="5" fill="#a7c896" transform="rotate(40 96 82)"/>`), body: `<rect width="${S}" height="${S}" fill="url(#f)"/>` }) },
  { id: "daisies", name: "Boho daisies", group: "Cute prints", tags: ["daisy", "boho", "flowers"],
    draw: (p) => ({ defs: pattern("dz", 300, 300, `<rect width="300" height="300" fill="${p.main}"/>${[[70, 80, 40], [220, 220, 34], [240, 60, 18], [90, 240, 20]].map(([x, y, r]) => `${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.28}" ry="${r * 0.62}" fill="${WHITE}" transform="rotate(${i * 36} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="${r * 0.32}" fill="#f7cf4f"/>`).join("")}`), body: `<rect width="${S}" height="${S}" fill="url(#dz)"/>` }) },
  { id: "scallop", name: "Scallops", group: "Cute prints", tags: ["scallop", "pattern", "retro"],
    draw: (p) => ({ defs: pattern("sc", 100, 60, `<rect width="100" height="60" fill="${p.main}"/><path d="M0 60 A50 50 0 0 1 100 60 Z" fill="${p.light}"/><path d="M-50 30 A50 50 0 0 1 50 30 M50 30 A50 50 0 0 1 150 30" fill="none" stroke="${p.accent}" stroke-width="3" opacity=".5"/>`), body: `<rect width="${S}" height="${S}" fill="url(#sc)"/>` }) },
  { id: "arches", name: "Boho arches", group: "Cute prints", tags: ["rainbow", "boho", "arches"],
    draw: (p) => ({ defs: pattern("ar", 240, 160, `<rect width="240" height="160" fill="${p.light}"/>${[[70, p.accent], [52, p.main], [34, p.pop]].map(([r, c]) => `<path d="M${120 - Number(r)} 130 A${r} ${r} 0 0 1 ${120 + Number(r)} 130" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round"/>`).join("")}`), body: `<rect width="${S}" height="${S}" fill="url(#ar)"/>` }) },
  { id: "terrazzo", name: "Terrazzo", group: "Cute prints", tags: ["terrazzo", "speckle", "modern"],
    draw: (p, seed) => { const r = rng(seed); const cols = [p.accent, p.main, p.pop, p.dark]; return { body: `<rect width="${S}" height="${S}" fill="${p.light}"/>${Array.from({ length: 220 }, (_, i) => { const x = r() * S; const y = r() * S; const s = 6 + r() * 22; const pts = Array.from({ length: 5 }, (_, k) => { const a = (k / 5) * Math.PI * 2 + r(); const rr = s * (0.6 + r() * 0.5); return `${(x + rr * Math.cos(a)).toFixed(0)},${(y + rr * Math.sin(a)).toFixed(0)}`; }).join(" "); return `<polygon points="${pts}" fill="${cols[i % 4]}" opacity="${i % 4 === 3 ? 0.35 : 0.8}"/>`; }).join("")}` }; } },
  { id: "confetti", name: "Confetti", group: "Cute prints", tags: ["confetti", "party", "birthday"],
    draw: (p, seed) => { const r = rng(seed); const cols = [p.accent, p.main, p.pop, p.dark]; return { body: `<rect width="${S}" height="${S}" fill="${p.light}"/>${Array.from({ length: 160 }, (_, i) => { const x = (r() * S).toFixed(0); const y = (r() * S).toFixed(0); const c = cols[i % 4]; return i % 2 ? `<circle cx="${x}" cy="${y}" r="${(5 + r() * 7).toFixed(0)}" fill="${c}"/>` : `<rect x="${x}" y="${y}" width="${(18 + r() * 14).toFixed(0)}" height="8" rx="4" fill="${c}" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})"/>`; }).join("")}` }; } },
];

/** Paper grain over every background — the "printed on real paper" feel. */
export function wrapBackground(defs: string, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${defs}<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  0 0 0 .07 0"/></filter></defs>${body}<rect width="${S}" height="${S}" filter="url(#grain)"/></svg>`;
}
