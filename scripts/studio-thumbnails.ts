/**
 * Renders a preview image for every Design Studio template that doesn't have
 * one yet, uploads it to Cloudinary and saves it as the template thumbnail.
 *
 * Without thumbnails the template pages draw every design live in the
 * browser (slow on phones with many templates). Admin-saved templates get a
 * thumbnail automatically; this covers seeded ones.
 *
 *   npm run studio:thumbnails                 (only templates without one)
 *   npm run studio:thumbnails -- --force      (re-render all)
 *   npm run studio:thumbnails -- --dry=<dir>  (write JPEGs locally, no upload)
 *   npm run studio:thumbnails -- --local      (save under public/studio/thumbnails
 *                                              and serve with the site — no Cloudinary)
 *
 * Text is drawn with the same Google fonts as the editor (turned into vector
 * paths), so previews match what customers see when they open a design.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import opentype from "opentype.js";
import { prisma } from "../src/lib/prisma";
import { parseDesignDoc, type DesignDoc, type DesignNode, type FontKey, type TextNode } from "../src/lib/studio/doc";
import { uploadImage } from "../src/lib/cloudinary";
import QRCode from "qrcode";
import { SvgPath, curvedTextPoint, moonPhase, skyAt, starRadius, traceMoonLit, tracePhotoMask } from "../src/lib/studio/smart";
import { CONSTELLATION_LINES, STARS } from "../src/lib/studio/sky-data";

const MAX_SIDE = 800;

// ─── Fonts ────────────────────────────────────────────────────────────────

type Variant = "400-normal" | "700-normal" | "400-italic" | "700-italic";
const FONT_FILES: Record<FontKey, { pkg: string; variants: Variant[] }> = {
  playfair: { pkg: "playfair-display", variants: ["400-normal", "700-normal", "400-italic", "700-italic"] },
  inter: { pkg: "inter", variants: ["400-normal", "700-normal"] },
  poppins: { pkg: "poppins", variants: ["400-normal", "700-normal", "400-italic", "700-italic"] },
  montserrat: { pkg: "montserrat", variants: ["400-normal", "700-normal", "400-italic", "700-italic"] },
  dancing: { pkg: "dancing-script", variants: ["400-normal", "700-normal"] },
  greatVibes: { pkg: "great-vibes", variants: ["400-normal"] },
  pacifico: { pkg: "pacifico", variants: ["400-normal"] },
  caveat: { pkg: "dancing-script", variants: ["400-normal", "700-normal"] }, // Caveat's glyphs don't parse in opentype.js; Dancing Script is the closest hand-script
  lobster: { pkg: "lobster", variants: ["400-normal"] },
  bebas: { pkg: "bebas-neue", variants: ["400-normal"] },
};

const fontCache = new Map<string, opentype.Font>();
function loadFont(key: FontKey, bold: boolean, italic: boolean) {
  const def = FONT_FILES[key] ?? FONT_FILES.inter;
  const want: Variant = `${bold ? 700 : 400}-${italic ? "italic" : "normal"}`;
  const variant =
    def.variants.find((v) => v === want) ?? def.variants.find((v) => v.startsWith(bold ? "700" : "400")) ?? def.variants[0];
  const file = path.join(process.cwd(), "node_modules", "@fontsource", def.pkg, "files", `${def.pkg}-latin-${variant}.woff`);
  let font = fontCache.get(file);
  if (!font) {
    const buf = fs.readFileSync(file);
    font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
    fontCache.set(file, font);
  }
  // Fake what the font file lacks, the way browsers do.
  return { font, fakeBold: bold && !variant.startsWith("700"), fakeItalic: italic && !variant.endsWith("italic") };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const n = (v: number) => (Math.round(v * 100) / 100).toString();

async function fetchImage(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("/")) return fs.readFileSync(path.join(process.cwd(), "public", decodeURIComponent(src)));
    const res = await fetch(src);
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/** PNG data URI, resized to the size it's drawn at (librsvg can't read WebP). */
async function dataUri(src: string, w: number, h: number) {
  const buf = await fetchImage(src);
  if (!buf) return null;
  const png = await sharp(buf).resize(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)), { fit: "fill" }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function coverUri(src: string, boxW: number, boxH: number) {
  const buf = await fetchImage(src);
  if (!buf) return null;
  const png = await sharp(buf).resize(Math.max(1, Math.round(boxW)), Math.max(1, Math.round(boxH)), { fit: "cover" }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

let defId = 0;
function shadowFilter(enabled: boolean, size: number, defs: string[]) {
  if (!enabled) return "";
  const blur = Math.max(4, size * 0.03);
  const id = `sh${defId++}`;
  defs.push(
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="${n(blur * 0.25)}" dy="${n(blur * 0.45)}" stdDeviation="${n(blur / 2)}" flood-color="#000" flood-opacity="0.28"/></filter>`,
  );
  return ` filter="url(#${id})"`;
}

function roundRect(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${n(x + rr)} ${n(y)}H${n(x + w - rr)}A${n(rr)} ${n(rr)} 0 0 1 ${n(x + w)} ${n(y + rr)}V${n(y + h - rr)}A${n(rr)} ${n(rr)} 0 0 1 ${n(x + w - rr)} ${n(y + h)}H${n(x + rr)}A${n(rr)} ${n(rr)} 0 0 1 ${n(x)} ${n(y + h - rr)}V${n(y + rr)}A${n(rr)} ${n(rr)} 0 0 1 ${n(x + rr)} ${n(y)}Z`;
}

// ─── Text (Konva-compatible word wrap) ────────────────────────────────────

function measure(font: opentype.Font, text: string, size: number, spacing: number) {
  return font.getAdvanceWidth(text, size) + spacing * text.length;
}

function wrapLines(font: opentype.Font, text: string, size: number, spacing: number, width: number) {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(font, next, size, spacing) > width + 0.5) {
        out.push(line);
        line = word;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

function textSvg(node: TextNode, color: string) {
  const { font, fakeBold, fakeItalic } = loadFont(node.fontFamily, node.bold, node.italic);
  const size = node.fontSize;
  const lineH = size * node.lineHeight;
  const lines = wrapLines(font, node.text || " ", size, node.letterSpacing, node.width);
  // Konva centres each line box on the em square's middle.
  const upm = font.unitsPerEm;
  const emMid = ((font.ascender + font.descender) / 2 / upm) * size;
  let d = "";
  let underline = "";
  if (node.curve) {
    const line = (node.text || " ").replace(/\n/g, " ");
    const total = measure(font, line, size, node.letterSpacing);
    let dist = (node.width - total) / 2;
    for (const glyph of font.stringToGlyphs(line)) {
      const adv = ((glyph.advanceWidth ?? 0) / upm) * size;
      const pt = curvedTextPoint(node.width, size, node.curve, dist + adv / 2);
      d += `<path transform="translate(${n(pt.x)} ${n(pt.y)}) rotate(${n(pt.angle)})" d="${glyph.getPath(-adv / 2, 0, size).toPathData(2)}"/>`;
      dist += adv + node.letterSpacing;
    }
    const strokeAttr = node.strokeWidth > 0 ? ` stroke="${node.stroke}" stroke-width="${n(node.strokeWidth)}" paint-order="stroke"` : "";
    return `<g fill="${color}"${strokeAttr}>${d}</g>`;
  }
  lines.forEach((line, i) => {
    const w = measure(font, line, size, node.letterSpacing);
    const x0 = node.align === "center" ? (node.width - w) / 2 : node.align === "right" ? node.width - w : 0;
    const baseline = i * lineH + lineH / 2 + emMid;
    let x = x0;
    for (const glyph of font.stringToGlyphs(line)) {
      d += glyph.getPath(x, baseline, size).toPathData(2);
      x += ((glyph.advanceWidth ?? 0) / upm) * size + node.letterSpacing;
    }
    if (node.underline && line.trim()) underline += `<rect x="${n(x0)}" y="${n(baseline + size * 0.08)}" width="${n(w)}" height="${n(Math.max(1, size * 0.06))}" fill="${color}"/>`;
  });
  const stroke =
    node.strokeWidth > 0
      ? ` stroke="${node.stroke}" stroke-width="${n(node.strokeWidth)}" paint-order="stroke" stroke-linejoin="round"`
      : fakeBold
        ? ` stroke="${color}" stroke-width="${n(size * 0.035)}" stroke-linejoin="round"`
        : "";
  const skew = fakeItalic ? ` transform="skewX(-12)"` : "";
  return `<g${skew}><path d="${d}" fill="${color}"${stroke}/>${underline}</g>`;
}

// ─── Nodes ────────────────────────────────────────────────────────────────

async function nodeSvg(node: DesignNode, scale: number, defs: string[]) {
  const transform = `translate(${n(node.x)} ${n(node.y)})${node.rotation ? ` rotate(${n(node.rotation)})` : ""}`;
  const open = `<g transform="${transform}"${node.opacity < 1 ? ` opacity="${n(node.opacity)}"` : ""}>`;
  const size = Math.min(node.width, node.height);

  if (node.type === "image") {
    const uri = await dataUri(node.src, node.width * scale, node.height * scale);
    if (!uri) return "";
    const flip = node.flipX ? ` transform="translate(${n(node.width)} 0) scale(-1 1)"` : "";
    return `${open}<g${shadowFilter(node.shadow, size, defs)}><image href="${uri}" width="${n(node.width)}" height="${n(node.height)}" preserveAspectRatio="none"${flip}/></g></g>`;
  }

  if (node.type === "photo") {
    const pad = Math.min(node.padding, node.width / 2 - 1, node.height / 2 - 1);
    const inner = { x: pad, y: pad, w: Math.max(1, node.width - pad * 2), h: Math.max(1, node.height - pad * 2) };
    const clipId = `cl${defId++}`;
    const clip = new SvgPath();
    tracePhotoMask(clip, node.mask, inner.x, inner.y, inner.w, inner.h, Math.max(0, node.cornerRadius - pad));
    defs.push(`<clipPath id="${clipId}"><path d="${clip.d}"/></clipPath>`);
    const outline = new SvgPath();
    tracePhotoMask(outline, node.mask, 0, 0, node.width, node.height, node.cornerRadius);
    const frame = `<path d="${outline.d}" fill="${node.fill}"${node.strokeWidth > 0 ? ` stroke="${node.stroke}" stroke-width="${n(node.strokeWidth)}"` : ""}${shadowFilter(node.shadow, size, defs)}/>`;
    let content: string;
    const uri = node.src ? await coverUri(node.src, inner.w * scale, inner.h * scale) : null;
    if (uri) {
      content = `<image href="${uri}" x="${n(inner.x)}" y="${n(inner.y)}" width="${n(inner.w)}" height="${n(inner.h)}" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      // Same soft placeholder as the editor, with a little photo icon.
      const s = Math.max(10, Math.min(inner.w, inner.h) * 0.16);
      const cx = inner.x + inner.w / 2;
      const cy = inner.y + inner.h / 2;
      content =
        `<rect x="${n(inner.x)}" y="${n(inner.y)}" width="${n(inner.w)}" height="${n(inner.h)}" fill="#e9ebf2"/>` +
        `<g fill="none" stroke="#9aa0b2" stroke-width="${n(s * 0.08)}" stroke-linejoin="round"><rect x="${n(cx - s / 2)}" y="${n(cy - s * 0.38)}" width="${n(s)}" height="${n(s * 0.76)}" rx="${n(s * 0.1)}"/><path d="M${n(cx - s * 0.42)} ${n(cy + s * 0.3)}L${n(cx - s * 0.1)} ${n(cy)}L${n(cx + s * 0.12)} ${n(cy + s * 0.2)}L${n(cx + s * 0.25)} ${n(cy + s * 0.08)}L${n(cx + s * 0.42)} ${n(cy + s * 0.3)}"/></g>` +
        `<circle cx="${n(cx + s * 0.22)}" cy="${n(cy - s * 0.16)}" r="${n(s * 0.07)}" fill="#9aa0b2"/>`;
    }
    return `${open}${frame}<g clip-path="url(#${clipId})">${content}</g></g>`;
  }

  if (node.type === "text") {
    return `${open}<g${shadowFilter(node.shadow, node.fontSize * 2, defs)}>${textSvg(node, node.fill)}</g></g>`;
  }

  if (node.type === "qr") {
    const side = Math.min(node.width, node.height);
    const ox = (node.width - side) / 2;
    const oy = (node.height - side) / 2;
    let body = `<rect x="${n(ox)}" y="${n(oy)}" width="${n(side)}" height="${n(side)}" fill="${node.bg}"/>`;
    try {
      const m = QRCode.create(node.data, { errorCorrectionLevel: "M" }).modules;
      const cell = side / (m.size + 4);
      let d = "";
      for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.get(r, c)) d += `M${n(ox + (c + 2) * cell)} ${n(oy + (r + 2) * cell)}h${n(cell + 0.2)}v${n(cell + 0.2)}h${n(-cell - 0.2)}Z`;
      body += `<path d="${d}" fill="${node.fg}"/>`;
    } catch {
      /* invalid data — background only */
    }
    return `${open}${body}</g>`;
  }

  if (node.type === "starmap") {
    const R = Math.min(node.width, node.height) / 2;
    const cx = node.width / 2;
    const cy = node.height / 2;
    const sky = skyAt(STARS, CONSTELLATION_LINES, node.date, node.utcOffset, node.lat, node.lon);
    const clipId = `sk${defId++}`;
    defs.push(`<clipPath id="${clipId}"><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R)}"/></clipPath>`);
    let body = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R)}" fill="${node.sky}"/>`;
    if (node.lines) {
      const d = sky.segments.map(([x1, y1, x2, y2]) => `M${n(cx + x1 * R)} ${n(cy + y1 * R)}L${n(cx + x2 * R)} ${n(cy + y2 * R)}`).join("");
      body += `<path d="${d}" stroke="${node.starColor}" stroke-opacity="0.42" stroke-width="${n(Math.max(0.6, R * 0.0045))}" fill="none"/>`;
    }
    body += sky.points.map((pt) => `<circle cx="${n(cx + pt.x * R)}" cy="${n(cy + pt.y * R)}" r="${n(Math.max(0.5, R * starRadius(pt.mag)))}" fill="${node.starColor}"/>`).join("");
    return `${open}<g clip-path="url(#${clipId})">${body}</g><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R * 0.994)}" fill="none" stroke="${node.starColor}" stroke-opacity="0.85" stroke-width="${n(R * 0.012)}"/></g>`;
  }

  if (node.type === "moon") {
    const r = Math.min(node.width, node.height) / 2 - 1;
    const lit = new SvgPath();
    traceMoonLit(lit, node.width / 2, node.height / 2, r, moonPhase(node.date, 330).phase);
    return `${open}<circle cx="${n(node.width / 2)}" cy="${n(node.height / 2)}" r="${n(r)}" fill="${node.dark}"/><path d="${lit.d}" fill="${node.lit}"/></g>`;
  }

  const stroke = node.strokeWidth > 0 ? ` stroke="${node.stroke}" stroke-width="${n(node.strokeWidth)}"` : "";
  const shape =
    node.type === "ellipse"
      ? `<ellipse cx="${n(node.width / 2)}" cy="${n(node.height / 2)}" rx="${n(node.width / 2)}" ry="${n(node.height / 2)}" fill="${node.fill}"${stroke}/>`
      : `<path d="${roundRect(0, 0, node.width, node.height, node.cornerRadius)}" fill="${node.fill}"${stroke}/>`;
  return `${open}<g${shadowFilter(node.shadow, size, defs)}>${shape}</g></g>`;
}

export async function renderDoc(doc: DesignDoc): Promise<Buffer> {
  const scale = MAX_SIDE / Math.max(doc.width, doc.height);
  const W = Math.round(doc.width * scale);
  const H = Math.round(doc.height * scale);
  const defs: string[] = [];
  let body = `<rect width="${doc.width}" height="${doc.height}" fill="${doc.background.color}"/>`;
  if (doc.background.imageUrl) {
    const uri = await coverUri(doc.background.imageUrl, W, H);
    if (uri) body += `<image href="${uri}" width="${doc.width}" height="${doc.height}" preserveAspectRatio="xMidYMid slice"/>`;
  }
  for (const node of doc.nodes) body += await nodeSvg(node, scale, defs);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${doc.width} ${doc.height}" width="${W}" height="${H}"><defs>${defs.join("")}</defs>${body}</svg>`;
  return sharp(Buffer.from(svg)).flatten({ background: doc.background.color }).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

async function main() {
  const force = process.argv.includes("--force");
  const dry = process.argv.find((a) => a.startsWith("--dry="))?.slice(6);
  const local = process.argv.includes("--local");
  const LOCAL_DIR = path.join(process.cwd(), "public", "studio", "thumbnails");
  if (local) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  const templates = await prisma.designTemplate.findMany({
    where: force ? {} : { thumbnailUrl: null },
    select: { id: true, name: true, sizeLabel: true, canvas: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });
  console.log(`Rendering ${templates.length} template preview(s)…`);
  if (dry) fs.mkdirSync(dry, { recursive: true });

  let ok = 0;
  for (const t of templates) {
    const parsed = parseDesignDoc(t.canvas);
    if ("error" in parsed) {
      console.warn(`! ${t.name} · ${t.sizeLabel}: ${parsed.error}`);
      continue;
    }
    const jpg = await renderDoc(parsed.doc);
    if (dry) {
      fs.writeFileSync(path.join(dry, `${t.name.replace(/[^\w]+/g, "-")}-${t.sizeLabel.replace(/[^\w]+/g, "")}.jpg`), jpg);
    } else if (local) {
      fs.writeFileSync(path.join(LOCAL_DIR, `${t.id}.jpg`), jpg);
      await prisma.designTemplate.update({ where: { id: t.id }, data: { thumbnailUrl: `/studio/thumbnails/${t.id}.jpg` } });
    } else {
      const { url } = await uploadImage(jpg, "studio/thumbnails");
      await prisma.designTemplate.update({ where: { id: t.id }, data: { thumbnailUrl: url } });
    }
    ok++;
    console.log(`  ✓ ${t.name} · ${t.sizeLabel}`);
  }
  console.log(`✓ ${ok} preview(s) ${dry ? `written to ${dry}` : local ? "saved to public/studio/thumbnails" : "uploaded"}`);
}

// Only run when executed directly (renderDoc can be imported).
if (process.argv[1]?.includes("studio-thumbnails")) main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
