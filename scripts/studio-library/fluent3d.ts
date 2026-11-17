/**
 * Imports Microsoft's Fluent Emoji 3D artwork (MIT licence — free for
 * commercial use, including printed products) as realistic 3D stickers for
 * the Design Studio.
 *
 * 1. Fetch only the 3D PNGs + metadata (≈60 MB) somewhere outside the repo:
 *      git clone --filter=blob:none --no-checkout --depth 1 https://github.com/microsoft/fluentui-emoji.git fluent
 *      cd fluent && git sparse-checkout init --no-cone
 *      printf '%s\n' '/assets/*\/metadata.json' '/assets/*\/3D/*' '/assets/*\/Default/3D/*' '/LICENSE' > .git/info/sparse-checkout
 *      git checkout
 * 2. npm run studio:library:3d -- --src=path/to/fluent
 *
 * Writes public/studio/library/stickers3d/ and manifest-3d.json (the editor
 * merges it with the generated manifest).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv.find((a) => a.startsWith("--src="))?.slice(6);
if (!SRC || !fs.existsSync(path.join(SRC, "assets"))) {
  console.error("Usage: npm run studio:library:3d -- --src=<fluentui-emoji checkout>");
  process.exit(1);
}

const OUT = path.join(process.cwd(), "public", "studio", "library", "stickers3d");
const THUMB = 128;

const GROUPS: Record<string, string> = {
  "Smileys & Emotion": "3D · Smileys & hearts",
  "Animals & Nature": "3D · Animals & nature",
  "Food & Drink": "3D · Food & drinks",
  Activities: "3D · Celebration & play",
  "People & Body": "3D · People & hands",
  "Travel & Places": "3D · Travel & places",
  Objects: "3D · Objects",
  Symbols: "3D · Symbols",
};
const ORDER = Object.values(GROUPS);

/** Most "Symbols" are arrows, keycaps and signage — keep only the decorative ones. */
const KEEP_SYMBOL = /heart|star|sparkl|flower|peace|infinity|yin|music|note|hundred|check mark|exclamation|question|dizzy|collision|ribbon|cross mark|om\b|wheel of dharma|khanda|atom|recycl|fleur|trident|crystal|diya|place of worship|cancer|virgo|leo|aries|taurus|gemini|libra|scorpio|sagittarius|capricorn|aquarius|pisces/i;

interface Meta {
  cldr: string;
  group: string;
  keywords?: string[];
}

function findPng(dir: string): string | null {
  for (const sub of ["3D", path.join("Default", "3D")]) {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) continue;
    const png = fs.readdirSync(d).find((f) => f.endsWith(".png"));
    if (png) return path.join(d, png);
  }
  return null;
}

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, "t"), { recursive: true });

  const assets = path.join(SRC!, "assets");
  const jobs: { id: string; name: string; group: string; tags: string[]; png: string }[] = [];
  for (const folder of fs.readdirSync(assets)) {
    const dir = path.join(assets, folder);
    let meta: Meta;
    try {
      meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
    } catch {
      continue;
    }
    const group = GROUPS[meta.group];
    if (!group) continue; // Flags
    if (meta.group === "Symbols" && !KEEP_SYMBOL.test(`${meta.cldr} ${(meta.keywords ?? []).join(" ")}`)) continue;
    const png = findPng(dir);
    if (!png) continue;
    const name = meta.cldr.charAt(0).toUpperCase() + meta.cldr.slice(1);
    jobs.push({
      id: `3d-${slug(meta.cldr)}`,
      name,
      group,
      tags: [...new Set(["3d", "realistic", "emoji", ...(meta.keywords ?? []), ...meta.cldr.split(/\s+/)].map((t) => t.toLowerCase()))],
      png,
    });
  }
  jobs.sort((a, b) => ORDER.indexOf(a.group) - ORDER.indexOf(b.group));

  let next = 0;
  let bytes = 0;
  const stickers: object[] = [];
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      const { data, info } = await sharp(job.png).trim({ threshold: 1 }).webp({ quality: 90, alphaQuality: 95, effort: 5 }).toBuffer({ resolveWithObject: true });
      fs.writeFileSync(path.join(OUT, `${job.id}.webp`), data);
      await sharp(data).resize(THUMB, THUMB, { fit: "inside" }).webp({ quality: 82 }).toFile(path.join(OUT, "t", `${job.id}.webp`));
      bytes += data.length;
      stickers.push({
        id: job.id,
        name: job.name,
        group: job.group,
        tags: job.tags,
        src: `/studio/library/stickers3d/${job.id}.webp`,
        thumb: `/studio/library/stickers3d/t/${job.id}.webp`,
        w: info.width,
        h: info.height,
      });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const order = new Map(jobs.map((j, i) => [j.id, i]));
  stickers.sort((a, b) => order.get((a as { id: string }).id)! - order.get((b as { id: string }).id)!);
  fs.writeFileSync(path.join(OUT, "..", "manifest-3d.json"), JSON.stringify({ version: 1, stickers }));
  fs.copyFileSync(path.join(SRC!, "LICENSE"), path.join(OUT, "LICENSE-fluentui-emoji.txt"));
  console.log(`✓ ${stickers.length} 3D stickers · ${(bytes / 1024 / 1024).toFixed(1)} MB (+ thumbnails)`);
}

main();
