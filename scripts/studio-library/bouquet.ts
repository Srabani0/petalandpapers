/**
 * Generates the Bouquet Builder's wrapping paper (back + front layers, so the
 * flowers sit *inside* the wrap), satin ribbons, the gift tag and the green
 * pipe-cleaner stem bundle.
 *
 *   npm run studio:library:bouquet
 *
 * Output: public/studio/bouquet/*.webp — all layers share the 1000×1250
 * bouquet canvas so they stack without any positioning maths.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { renderStrands, stem, type Strand } from "./chenille";
import { BOUQUET_CANVAS, RIBBONS, WRAPS } from "../../src/lib/studio/bouquet";

const OUT = path.join(process.cwd(), "public", "studio", "bouquet");
const { width: W, height: H } = BOUQUET_CANVAS;
const SCALE = 1.2; // a little extra resolution for print

const mix = (hex: string, to: string, t: number) => {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(to.slice(i, i + 2), 16));
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
};

/** Soft paper grain + gentle lighting, shared by every sheet. */
function paperDefs(id: string, colour: string) {
  return `
  <filter id="${id}-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0"/>
    <feComposite in2="SourceGraphic" operator="in" result="g"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge>
  </filter>
  <filter id="${id}-shadow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#2b1d12" flood-opacity="0.22"/>
  </filter>
  <linearGradient id="${id}-lit" x1="0" y1="0" x2="1" y2="0.35">
    <stop offset="0" stop-color="${mix(colour, "#ffffff", 0.22)}"/>
    <stop offset="0.55" stop-color="${colour}"/>
    <stop offset="1" stop-color="${mix(colour, "#000000", 0.14)}"/>
  </linearGradient>
  <linearGradient id="${id}-shade" x1="1" y1="0" x2="0" y2="0.35">
    <stop offset="0" stop-color="${mix(colour, "#ffffff", 0.1)}"/>
    <stop offset="0.6" stop-color="${mix(colour, "#000000", 0.08)}"/>
    <stop offset="1" stop-color="${mix(colour, "#000000", 0.2)}"/>
  </linearGradient>
  <linearGradient id="${id}-inside" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${mix(colour, "#000000", 0.12)}"/>
    <stop offset="1" stop-color="${mix(colour, "#000000", 0.32)}"/>
  </linearGradient>`;
}

/** Back layer: two sheets fanning up behind the flowers + the dark inside of the cone. */
function wrapBack(colour: string) {
  const id = "b";
  const crease = mix(colour, "#000000", 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}">
  <defs>${paperDefs(id, colour)}</defs>
  <g filter="url(#${id}-shadow)">
    <path d="M500 1225 L70 330 Q90 250 190 205 Q300 160 380 180 Z" fill="url(#${id}-lit)" filter="url(#${id}-grain)"/>
    <path d="M500 1225 L930 330 Q910 250 810 205 Q700 160 620 180 Z" fill="url(#${id}-shade)" filter="url(#${id}-grain)"/>
    <path d="M500 1225 L250 240 Q370 150 500 140 Q630 150 750 240 Z" fill="url(#${id}-lit)" filter="url(#${id}-grain)" opacity="0.96"/>
  </g>
  <path d="M500 1170 L170 560 Q500 470 830 560 Z" fill="url(#${id}-inside)"/>
  <g stroke="${crease}" stroke-opacity="0.35" stroke-width="2" fill="none">
    <path d="M500 1170 L230 300"/><path d="M500 1170 L770 300"/><path d="M500 1170 L500 150"/>
  </g>
</svg>`;
}

/** Front layer: the cone wrapped around the stems, with a folded top edge. */
function wrapFront(colour: string) {
  const id = "f";
  const fold = mix(colour, "#ffffff", 0.35);
  const crease = mix(colour, "#000000", 0.2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}">
  <defs>${paperDefs(id, colour)}</defs>
  <g filter="url(#${id}-shadow)">
    <!-- right sheet (behind) -->
    <path d="M478 1236 L880 690 Q800 640 700 640 Q590 650 460 712 Z" fill="url(#${id}-shade)" filter="url(#${id}-grain)"/>
    <path d="M880 690 Q800 640 700 640 Q590 650 460 712 Q600 668 700 668 Q790 668 880 690 Z" fill="${fold}" opacity="0.8"/>
    <!-- left sheet (front) -->
    <path d="M532 1240 L500 1240 L110 680 Q210 630 320 632 Q450 640 600 730 Z" fill="url(#${id}-lit)" filter="url(#${id}-grain)"/>
    <path d="M110 680 Q210 630 320 632 Q450 640 600 730 Q450 670 320 660 Q210 656 110 680 Z" fill="${fold}" opacity="0.85"/>
  </g>
  <g stroke="${crease}" stroke-opacity="0.32" stroke-width="2.2" fill="none">
    <path d="M490 1225 L250 700"/><path d="M500 1228 L400 700"/><path d="M515 1225 L690 690"/>
  </g>
</svg>`;
}

/** Satin bow with two loops, a knot and two tails. */
function ribbon(colour: string) {
  const hi = mix(colour, "#ffffff", 0.45);
  const lo = mix(colour, "#000000", 0.28);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 380" width="${420 * SCALE}" height="${380 * SCALE}">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="0.45" stop-color="${colour}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lo}"/><stop offset="0.5" stop-color="${colour}"/><stop offset="1" stop-color="${hi}"/></linearGradient>
    <filter id="d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#2b1d12" flood-opacity="0.3"/></filter>
  </defs>
  <g filter="url(#d)">
    <path d="M200 160 L120 360 L160 345 L185 372 L215 175 Z" fill="url(#t)"/>
    <path d="M220 160 L320 352 L280 342 L262 372 L205 175 Z" fill="url(#t)"/>
    <path d="M205 150 C150 60 40 40 30 110 C22 170 120 200 205 170 Z" fill="url(#s)"/>
    <path d="M215 150 C270 60 380 40 390 110 C398 170 300 200 215 170 Z" fill="url(#s)"/>
    <path d="M70 100 C110 80 160 110 190 150" stroke="${hi}" stroke-opacity="0.6" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M350 100 C310 80 260 110 230 150" stroke="${lo}" stroke-opacity="0.45" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="178" y="128" width="64" height="58" rx="18" fill="url(#s)"/>
  </g>
</svg>`;
}

/** Kraft gift tag on a string (the message is added as editable text). */
function tag() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="${300 * SCALE}" height="${380 * SCALE}">
  <defs>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.16 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <filter id="d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#2b1d12" flood-opacity="0.3"/></filter>
  </defs>
  <path d="M150 0 C150 30 150 40 150 58" stroke="#8a6a4a" stroke-width="3" fill="none"/>
  <g filter="url(#d)">
    <path d="M60 40 L240 40 L285 85 L285 360 Q285 375 270 375 L30 375 Q15 375 15 360 L15 85 Z" fill="#d9b78f"/>
    <path d="M60 40 L240 40 L285 85 L285 360 Q285 375 270 375 L30 375 Q15 375 15 360 L15 85 Z" fill="#000" filter="url(#g)"/>
    <path d="M28 92 L272 92 L272 362 L28 362 Z" fill="none" stroke="#fff8ee" stroke-opacity="0.65" stroke-width="2" stroke-dasharray="7 6"/>
  </g>
  <circle cx="150" cy="64" r="11" fill="#fdf8f0" stroke="#b08860" stroke-width="3"/>
</svg>`;
}

/** Green pipe-cleaner stems gathered at the bottom (hidden mostly by the front wrap). */
function stems() {
  const strands: Strand[] = [];
  const tips: [number, number][] = [];
  for (let i = 0; i < 11; i++) tips.push([120 + i * 76, 60 + Math.abs(5 - i) * 18]);
  for (const [i, [x, y]] of tips.entries()) {
    strands.push({ pts: stem([500 + (i - 5) * 6, 980], [x, y], (i - 5) * 6), color: i % 3 ? "#55a03c" : "#4a8f34", r: 9 });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${1000 * SCALE * 0.6}" height="${1000 * SCALE * 0.6}">${renderStrands(strands, 42)}</svg>`;
}

async function write(name: string, svg: string) {
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 84, alphaQuality: 90, effort: 5 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${name}.webp`), buf);
  return buf.length;
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  let bytes = 0;
  for (const w of WRAPS) {
    bytes += await write(`wrap-back-${w.id}`, wrapBack(w.colour));
    bytes += await write(`wrap-front-${w.id}`, wrapFront(w.colour));
  }
  for (const r of RIBBONS) bytes += await write(`ribbon-${r.id}`, ribbon(r.colour));
  bytes += await write("tag", tag());
  bytes += await write("stems", stems());
  console.log(`✓ bouquet assets · ${(bytes / 1024).toFixed(0)} KB`);
}

main();
