/**
 * Generates the Design Studio library: ~1000 stickers + ~300 backgrounds as
 * WebP files (plus thumbnails) and a manifest the editor reads.
 *
 *   npm run studio:library
 *
 * Deterministic: re-running produces the same files. Output lives in
 * public/studio/library and is served statically.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { PALETTES, sticker, type StickerSvg } from "./kit";
import { MOTIFS, WASHI_PATTERNS, kawaiiFace, washi } from "./motifs";
import { PHRASES, WORD_STYLES, wordSticker } from "./words";
import { BACKGROUNDS, BG_SIZE, wrapBackground } from "./backgrounds";

const OUT = path.join(process.cwd(), "public", "studio", "library");
const STICKER_MAX = 600;
const STICKER_THUMB = 160;
const BG_THUMB = 240;

interface Job {
  kind: "sticker" | "background";
  id: string;
  name: string;
  group: string;
  tags: string[];
  svg: string;
  dieCut?: boolean;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const svgOf = (s: StickerSvg) => ({ svg: s.svg, dieCut: s.dieCut });

/**
 * White die-cut border: grow the artwork's silhouette (blur + threshold on
 * its alpha), fill it white with a faint grey edge, and lay the art on top.
 */
async function dieCut(png: Buffer, w: number, h: number) {
  const r = Math.max(6, Math.round(Math.max(w, h) * 0.028));
  const alpha = await sharp(png).extractChannel(3).raw().toBuffer();
  const grow = (sigma: number, cut: number) =>
    sharp(alpha, { raw: { width: w, height: h, channels: 1 } })
      .blur(sigma)
      .threshold(cut)
      .blur(0.8)
      .extractChannel(0)
      .raw()
      .toBuffer();
  const [white, edge] = await Promise.all([grow(r / 2, 6), grow(r / 2 + 1, 3)]);
  const layer = (mask: Buffer, colour: string) =>
    sharp({ create: { width: w, height: h, channels: 3, background: colour } })
      .joinChannel(mask, { raw: { width: w, height: h, channels: 1 } })
      .png()
      .toBuffer();
  const [edgeL, whiteL] = await Promise.all([layer(edge, "#d9d2c7"), layer(white, "#ffffff")]);
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: edgeL }, { input: whiteL }, { input: png }])
    .png()
    .toBuffer();
}

function collect(): Job[] {
  const jobs: Job[] = [];
  const seen = new Set<string>();
  const add = (job: Job) => {
    const hash = crypto.createHash("sha1").update(job.svg).digest("hex");
    if (seen.has(hash)) return; // fixed-colour motifs look the same in every palette
    seen.add(hash);
    jobs.push(job);
  };

  // Motifs × palettes (+ kawaii faces).
  MOTIFS.forEach((m, mi) => {
    const box = m.box ?? { x: 0, y: 0, w: 200, h: 200 };
    for (let k = 0; k < 7; k++) {
      const p = PALETTES[(mi * 3 + k * 2) % PALETTES.length];
      add({
        kind: "sticker",
        id: `${slug(m.group)}-${m.id}-${p.key}`,
        name: m.name,
        group: m.group,
        tags: [...m.tags, p.name.toLowerCase()],
        ...svgOf(sticker(m.draw(p), box, { dieCut: m.dieCut })),
      });
    }
    if (m.face) {
      for (let k = 0; k < 3; k++) {
        const p = PALETTES[(mi * 5 + k * 4 + 1) % PALETTES.length];
        add({
          kind: "sticker",
          id: `kawaii-${m.id}-${p.key}`,
          name: `Kawaii ${m.name.toLowerCase()}`,
          group: "Kawaii",
          tags: [...m.tags, "kawaii", "cute", "face", p.name.toLowerCase()],
          ...svgOf(sticker(m.draw(p) + kawaiiFace(m.face.cx, m.face.cy, m.face.s, "#3b2f2f"), box, { dieCut: m.dieCut })),
        });
      }
    }
  });

  // Washi tape.
  for (const pattern of WASHI_PATTERNS) {
    for (const p of PALETTES) {
      const w = washi(p, pattern);
      add({
        kind: "sticker",
        id: `washi-${pattern}-${p.key}`,
        name: `Washi tape · ${pattern}`,
        group: "Washi tape",
        tags: ["washi", "tape", pattern, p.name.toLowerCase()],
        ...svgOf(sticker(w.body, w.box)),
      });
    }
  }

  // Lettering: every phrase in three styles / palettes.
  PHRASES.forEach((ph, i) => {
    for (let k = 0; k < 3; k++) {
      const style = WORD_STYLES[(i + k * 2) % WORD_STYLES.length];
      const p = PALETTES[(i * 7 + k * 3) % PALETTES.length];
      add({
        kind: "sticker",
        id: `words-${slug(ph.text)}-${style}-${p.key}`,
        name: ph.text,
        group: `Words · ${ph.group}`,
        tags: [...ph.tags, "words", "quote", "text", style, ...ph.text.split(/\W+/).filter(Boolean)],
        ...svgOf(wordSticker(ph.text, style, p, i + k)),
      });
    }
  });

  // Backgrounds: pattern × palette.
  BACKGROUNDS.forEach((b, bi) => {
    PALETTES.forEach((p, pi) => {
      const { defs = "", body } = b.draw(p, (bi + 1) * 1000 + pi * 37);
      add({
        kind: "background",
        id: `${b.id}-${p.key}`,
        name: `${b.name} · ${p.name}`,
        group: b.group,
        tags: [...b.tags, p.name.toLowerCase(), p.key],
        svg: wrapBackground(defs, body),
      });
    });
  });

  return jobs;
}

async function render(job: Job) {
  const dir = job.kind === "sticker" ? "stickers" : "backgrounds";
  const file = path.join(OUT, dir, `${job.id}.webp`);
  const thumb = path.join(OUT, dir, "t", `${job.id}.webp`);
  const input = Buffer.from(job.svg);

  if (job.kind === "sticker") {
    const meta = await sharp(input).metadata();
    const scale = STICKER_MAX / Math.max(meta.width ?? STICKER_MAX, meta.height ?? STICKER_MAX);
    const raster = await sharp(input, { density: Math.min(2400, 72 * scale) })
      .resize(STICKER_MAX, STICKER_MAX, { fit: "inside" })
      .png()
      .toBuffer({ resolveWithObject: true });
    const art = job.dieCut ? await dieCut(raster.data, raster.info.width, raster.info.height) : raster.data;
    const full = await sharp(art).webp({ quality: 88, alphaQuality: 90, effort: 4 }).toBuffer({ resolveWithObject: true });
    fs.writeFileSync(file, full.data);
    await sharp(full.data).resize(STICKER_THUMB, STICKER_THUMB, { fit: "inside" }).webp({ quality: 80 }).toFile(thumb);
    return { w: full.info.width, h: full.info.height, bytes: full.data.length };
  }

  const full = await sharp(input).webp({ quality: 80, effort: 5 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(file, full.data);
  await sharp(full.data).resize(BG_THUMB, BG_THUMB).webp({ quality: 78 }).toFile(thumb);
  return { w: BG_SIZE, h: BG_SIZE, bytes: full.data.length };
}

const ONLY = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1] as "stickers" | "backgrounds" | undefined;

async function reuse(job: Job) {
  const file = path.join(OUT, job.kind === "sticker" ? "stickers" : "backgrounds", `${job.id}.webp`);
  if (!fs.existsSync(file)) return null;
  const meta = await sharp(file).metadata();
  return { w: meta.width ?? 0, h: meta.height ?? 0, bytes: fs.statSync(file).size };
}

async function main() {
  if (ONLY) fs.rmSync(path.join(OUT, ONLY), { recursive: true, force: true });
  else fs.rmSync(OUT, { recursive: true, force: true });
  for (const d of ["stickers/t", "backgrounds/t"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });

  const jobs = collect();
  console.log(`Rendering ${jobs.filter((j) => j.kind === "sticker").length} stickers + ${jobs.filter((j) => j.kind === "background").length} backgrounds…`);

  const results = new Map<string, { w: number; h: number; bytes: number }>();
  let next = 0;
  let done = 0;
  const failures: string[] = [];
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        const kept = ONLY && !ONLY.startsWith(job.kind) ? await reuse(job) : null;
        results.set(job.id, kept ?? (await render(job)));
      } catch (err) {
        failures.push(`${job.id}: ${(err as Error).message}`);
      }
      if (++done % 100 === 0) console.log(`  ${done}/${jobs.length}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const entry = (j: Job) => {
    const r = results.get(j.id)!;
    const dir = j.kind === "sticker" ? "stickers" : "backgrounds";
    return { id: j.id, name: j.name, group: j.group, tags: [...new Set(j.tags)], src: `/studio/library/${dir}/${j.id}.webp`, thumb: `/studio/library/${dir}/t/${j.id}.webp`, w: r.w, h: r.h };
  };
  const ok = jobs.filter((j) => results.has(j.id));
  const manifest = {
    version: 1,
    stickers: ok.filter((j) => j.kind === "sticker").map(entry),
    backgrounds: ok.filter((j) => j.kind === "background").map(entry),
  };
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest));

  const total = [...results.values()].reduce((s, r) => s + r.bytes, 0);
  console.log(`✓ ${manifest.stickers.length} stickers, ${manifest.backgrounds.length} backgrounds · ${(total / 1024 / 1024).toFixed(1)} MB (+ thumbnails)`);
  if (failures.length) {
    console.error(`✗ ${failures.length} failed:\n${failures.slice(0, 20).join("\n")}`);
    process.exitCode = 1;
  }
}

main();
