/**
 * Starter sticker library for the Design Studio, drawn as SVG so it ships with
 * the site (public/studio/stickers) — no uploads needed. Replace or extend
 * from Admin → Design Studio → category → Elements library at any time.
 *
 * Text inside SVG stickers only uses system fonts: an SVG drawn through an
 * <img> can't load web fonts.
 */

export interface StickerDef {
  file: string;
  name: string;
  group: string;
  /** Which studio categories get it (slugs); "*" = all. */
  for: string[];
  svg: string;
}

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const SCRIPT = "'Brush Script MT', 'Segoe Script', cursive";

const ALL = ["*"];
const DECOR = ["3d-miniature", "photo-frames"];
const GIFTY = ["3d-miniature", "photo-frames", "mugs", "flower-bouquet"];

export const STICKERS: StickerDef[] = [
  // ── Teacher's Day ────────────────────────────────────────────────────────
  {
    file: "best-teacher-ever.svg",
    name: "Best Teacher Ever",
    group: "Teacher's Day",
    for: ALL,
    svg: svg(
      420,
      300,
      `<g transform="rotate(-8 210 150)">
        <path d="M30 80 Q210 20 390 80 L380 230 Q210 280 40 230 Z" fill="#fff" stroke="#1e2a4a" stroke-width="6"/>
        <text x="210" y="125" text-anchor="middle" font-family="${SCRIPT}" font-size="78" fill="#c0392b">Best</text>
        <text x="210" y="185" text-anchor="middle" font-family="${SANS}" font-size="50" fill="#1e2a4a" letter-spacing="2">TEACHER</text>
        <text x="215" y="240" text-anchor="middle" font-family="${SCRIPT}" font-size="64" fill="#2e86c1">Ever!</text>
        <circle cx="62" cy="96" r="14" fill="#c0392b"/><path d="M62 82 q6 -10 14 -8" stroke="#2e7d32" stroke-width="5" fill="none"/>
        <path d="M352 205 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3z" fill="#f4b400"/>
      </g>`,
    ),
  },
  {
    file: "happy-teachers-day.svg",
    name: "Happy Teachers Day card",
    group: "Teacher's Day",
    for: ALL,
    svg: svg(
      300,
      340,
      `<rect x="8" y="8" width="284" height="324" fill="#fff" stroke="#111" stroke-width="10"/>
      <rect x="28" y="28" width="244" height="284" fill="#fdfaf3"/>
      <path d="M150 62 l60 22 -60 22 -60 -22z" fill="#1e2a4a"/><rect x="128" y="92" width="44" height="22" fill="#1e2a4a"/>
      <line x1="205" y1="84" x2="205" y2="118" stroke="#c79a5d" stroke-width="4"/>
      <text x="150" y="170" text-anchor="middle" font-family="${SANS}" font-size="34" fill="#1e2a4a">HAPPY</text>
      <text x="150" y="212" text-anchor="middle" font-family="${SANS}" font-size="30" fill="#1e2a4a">TEACHERS DAY</text>
      <text x="150" y="262" text-anchor="middle" font-family="${SCRIPT}" font-size="40" fill="#2e86c1">my mentor!</text>`,
    ),
  },
  {
    file: "trophy.svg",
    name: "Trophy",
    group: "Props",
    for: ALL,
    svg: svg(
      240,
      280,
      `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#b8860b"/><stop offset=".45" stop-color="#ffd966"/><stop offset="1" stop-color="#a87406"/></linearGradient></defs>
      <path d="M60 30 h120 v50 q0 70 -60 80 q-60 -10 -60 -80z" fill="url(#g)"/>
      <path d="M60 50 q-40 0 -36 32 q4 30 44 36" fill="none" stroke="url(#g)" stroke-width="14"/>
      <path d="M180 50 q40 0 36 32 q-4 30 -44 36" fill="none" stroke="url(#g)" stroke-width="14"/>
      <rect x="108" y="158" width="24" height="44" fill="url(#g)"/>
      <rect x="72" y="200" width="96" height="24" rx="4" fill="url(#g)"/>
      <rect x="56" y="222" width="128" height="34" rx="5" fill="#5d4037"/>
      <path d="M120 70 l10 20 22 3 -16 15 4 22 -20 -11 -20 11 4 -22 -16 -15 22 -3z" fill="#fff6d0"/>`,
    ),
  },
  {
    file: "apple.svg",
    name: "Apple",
    group: "Teacher's Day",
    for: ALL,
    svg: svg(
      220,
      240,
      `<path d="M110 70 q-50 -30 -80 10 q-30 50 0 110 q25 45 60 30 q20 -8 40 0 q35 15 60 -30 q30 -60 0 -110 q-30 -40 -80 -10z" fill="#d32f2f"/>
      <ellipse cx="72" cy="110" rx="16" ry="30" fill="#fff" opacity=".25"/>
      <path d="M110 70 q-6 -30 8 -52" stroke="#5d4037" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M120 40 q30 -30 62 -10 q-28 30 -62 10z" fill="#43a047"/>`,
    ),
  },
  {
    file: "books.svg",
    name: "Stack of books",
    group: "Props",
    for: DECOR,
    svg: svg(
      260,
      220,
      `<rect x="20" y="160" width="220" height="40" rx="4" fill="#1e3a5f"/><rect x="28" y="168" width="204" height="6" fill="#f5e6c8"/>
      <rect x="34" y="118" width="196" height="40" rx="4" fill="#a93226"/><rect x="40" y="126" width="184" height="6" fill="#f5e6c8"/>
      <rect x="26" y="78" width="200" height="38" rx="4" fill="#2e7d32"/><rect x="32" y="85" width="188" height="6" fill="#f5e6c8"/>
      <rect x="44" y="40" width="180" height="36" rx="4" fill="#c79a5d"/><rect x="50" y="47" width="168" height="6" fill="#fff"/>
      <text x="134" y="190" text-anchor="middle" font-family="${SERIF}" font-size="16" fill="#f5e6c8">KNOWLEDGE</text>`,
    ),
  },
  {
    file: "standing-books.svg",
    name: "Standing books",
    group: "Props",
    for: DECOR,
    svg: svg(
      200,
      260,
      `<rect x="10" y="30" width="38" height="220" rx="3" fill="#7b1f1f"/><rect x="16" y="60" width="26" height="8" fill="#e8c46a"/>
      <rect x="50" y="10" width="42" height="240" rx="3" fill="#1e2a4a"/><rect x="56" y="40" width="30" height="8" fill="#e8c46a"/>
      <rect x="94" y="40" width="34" height="210" rx="3" fill="#bfa27a"/><rect x="100" y="70" width="22" height="8" fill="#5d4037"/>
      <g transform="rotate(16 150 250)"><rect x="130" y="40" width="44" height="212" rx="3" fill="#5b8fb9"/><rect x="136" y="70" width="32" height="8" fill="#fff"/></g>`,
    ),
  },
  {
    file: "graduation-cap.svg",
    name: "Graduation cap",
    group: "Teacher's Day",
    for: ALL,
    svg: svg(
      280,
      200,
      `<path d="M140 20 l130 50 -130 50 -130 -50z" fill="#1b1b1b"/>
      <path d="M70 92 v50 q70 40 140 0 v-50 l-70 28z" fill="#2b2b2b"/>
      <line x1="240" y1="70" x2="240" y2="150" stroke="#f4b400" stroke-width="5"/>
      <path d="M232 150 h16 l6 30 h-28z" fill="#f4b400"/><circle cx="140" cy="70" r="7" fill="#f4b400"/>`,
    ),
  },
  {
    file: "pencil.svg",
    name: "Pencil",
    group: "Teacher's Day",
    for: ALL,
    svg: svg(
      300,
      80,
      `<rect x="40" y="20" width="200" height="40" fill="#f9c80e"/><rect x="40" y="20" width="200" height="13" fill="#fbd94a"/>
      <rect x="10" y="20" width="34" height="40" rx="6" fill="#f48fb1"/><rect x="40" y="20" width="14" height="40" fill="#b0bec5"/>
      <path d="M240 20 l50 20 -50 20z" fill="#f2d4a5"/><path d="M276 34 l14 6 -14 6z" fill="#333"/>`,
    ),
  },
  {
    file: "calendar-sep-5.svg",
    name: "Calendar · Sep 5",
    group: "Teacher's Day",
    for: ALL,
    svg: svg(
      200,
      220,
      `<rect x="10" y="20" width="180" height="190" rx="14" fill="#fff" stroke="#ddd" stroke-width="4"/>
      <path d="M10 34 q0 -14 14 -14 h152 q14 0 14 14 v44 h-180z" fill="#e53935"/>
      <text x="100" y="66" text-anchor="middle" font-family="${SANS}" font-size="34" fill="#fff">SEP</text>
      <text x="100" y="180" text-anchor="middle" font-family="${SANS}" font-size="98" fill="#222">5</text>
      <rect x="44" y="6" width="12" height="30" rx="6" fill="#555"/><rect x="144" y="6" width="12" height="30" rx="6" fill="#555"/>`,
    ),
  },
  {
    file: "quote-plant-seeds.svg",
    name: "Quote · Teachers plant seeds",
    group: "Quotes",
    for: ALL,
    svg: svg(
      300,
      340,
      `<rect x="8" y="8" width="284" height="324" fill="#fff" stroke="#111" stroke-width="10"/>
      <text x="150" y="90" text-anchor="middle" font-family="${SCRIPT}" font-size="46" fill="#1565c0">Teachers</text>
      <text x="150" y="140" text-anchor="middle" font-family="${SANS}" font-size="26" fill="#e65100">PLANT THE SEEDS</text>
      <text x="150" y="182" text-anchor="middle" font-family="${SERIF}" font-size="24" fill="#333">of knowledge that</text>
      <text x="150" y="232" text-anchor="middle" font-family="${SCRIPT}" font-size="48" fill="#2e7d32">grow forever</text>
      <path d="M150 300 v-34 m0 10 q-24 -6 -30 -26 q24 2 30 26 m0 -6 q22 -8 30 -28 q-24 4 -30 28" stroke="#2e7d32" stroke-width="5" fill="#66bb6a"/>`,
    ),
  },
  {
    file: "quote-mindset.svg",
    name: "Quote · Mindset is the master",
    group: "Quotes",
    for: ALL,
    svg: svg(
      300,
      300,
      `<rect x="8" y="8" width="284" height="284" fill="#fff" stroke="#111" stroke-width="10"/>
      <text x="150" y="128" text-anchor="middle" font-family="${SANS}" font-size="44" fill="#111">MINDSET</text>
      <text x="150" y="176" text-anchor="middle" font-family="${SANS}" font-size="20" fill="#333">IS THE MASTER</text>
      <text x="150" y="204" text-anchor="middle" font-family="${SANS}" font-size="20" fill="#333">OF SUCCESS</text>`,
    ),
  },
  {
    file: "quote-foundation.svg",
    name: "Quote · Teachers are the foundation",
    group: "Quotes",
    for: ALL,
    svg: svg(
      300,
      320,
      `<rect x="8" y="8" width="284" height="304" fill="#fff" stroke="#111" stroke-width="10"/>
      <path d="M120 60 q30 -14 30 0 q0 -14 30 0 v34 q-30 -12 -30 0 q0 -12 -30 0z" fill="#2e7d32"/>
      <text x="150" y="140" text-anchor="middle" font-family="${SANS}" font-size="24" fill="#1e2a4a">TEACHERS ARE</text>
      <text x="150" y="176" text-anchor="middle" font-family="${SANS}" font-size="24" fill="#1e2a4a">THE FOUNDATION…</text>
      <text x="150" y="214" text-anchor="middle" font-family="${SERIF}" font-size="18" fill="#333">for growth &amp; knowledge.</text>
      <text x="150" y="262" text-anchor="middle" font-family="${SCRIPT}" font-size="34" fill="#a93226">Together we thrive</text>`,
    ),
  },

  // ── Decor props for miniatures ───────────────────────────────────────────
  {
    file: "wall-clock.svg",
    name: "Clock",
    group: "Props",
    for: DECOR,
    svg: svg(
      220,
      220,
      `<circle cx="110" cy="110" r="100" fill="#fafafa" stroke="#37474f" stroke-width="12"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 110 + Math.sin(a) * 76;
        const y1 = 110 - Math.cos(a) * 76;
        const x2 = 110 + Math.sin(a) * 88;
        const y2 = 110 - Math.cos(a) * 88;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#37474f" stroke-width="${i % 3 === 0 ? 6 : 3}"/>`;
      }).join("")}
      <line x1="110" y1="110" x2="110" y2="52" stroke="#222" stroke-width="7" stroke-linecap="round"/>
      <line x1="110" y1="110" x2="152" y2="128" stroke="#222" stroke-width="5" stroke-linecap="round"/>
      <circle cx="110" cy="110" r="7" fill="#c62828"/>`,
    ),
  },
  {
    file: "potted-plant.svg",
    name: "Potted flowers",
    group: "Props",
    for: DECOR,
    svg: svg(
      220,
      260,
      `<path d="M60 160 h100 l-14 90 h-72z" fill="#fafafa" stroke="#ddd" stroke-width="3"/><rect x="54" y="150" width="112" height="20" rx="4" fill="#fff" stroke="#ddd" stroke-width="3"/>
      <path d="M110 150 q-10 -50 -40 -70 M110 150 q10 -60 44 -76 M110 150 v-80" stroke="#2e7d32" stroke-width="6" fill="none"/>
      <path d="M80 120 q-30 0 -36 -20 q28 -4 36 20z M140 116 q30 -2 38 -22 q-30 -2 -38 22z" fill="#43a047"/>
      ${[
        [70, 78],
        [110, 62],
        [152, 72],
        [92, 100],
        [130, 96],
      ]
        .map(
          ([x, y]) =>
            `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288]
              .map((r) => `<ellipse rx="9" ry="17" cy="-12" transform="rotate(${r})" fill="#7e57c2"/>`)
              .join("")}<circle r="7" fill="#ffd54f"/></g>`,
        )
        .join("")}`,
    ),
  },
  {
    file: "smiley-ball.svg",
    name: "Smiley",
    group: "Props",
    for: ALL,
    svg: svg(
      160,
      160,
      `<circle cx="80" cy="80" r="74" fill="#ff8f00"/><circle cx="58" cy="64" r="9" fill="#222"/><circle cx="102" cy="64" r="9" fill="#222"/>
      <path d="M44 92 q36 40 72 0" stroke="#222" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="40" rx="18" ry="10" fill="#fff" opacity=".35"/>`,
    ),
  },
  {
    file: "table-lamp.svg",
    name: "Table lamp",
    group: "Props",
    for: DECOR,
    svg: svg(
      180,
      260,
      `<path d="M40 20 h100 l26 100 h-152z" fill="#f6e3b4" stroke="#c79a5d" stroke-width="4"/>
      <rect x="84" y="120" width="12" height="100" fill="#8d6e63"/><ellipse cx="90" cy="236" rx="60" ry="16" fill="#5d4037"/>
      <ellipse cx="90" cy="120" rx="76" ry="10" fill="#fff6d6" opacity=".7"/>`,
    ),
  },
  {
    file: "camera.svg",
    name: "Camera",
    group: "Props",
    for: DECOR,
    svg: svg(
      260,
      190,
      `<rect x="10" y="40" width="240" height="140" rx="20" fill="#37474f"/><rect x="80" y="16" width="80" height="34" rx="8" fill="#455a64"/>
      <circle cx="130" cy="110" r="52" fill="#263238" stroke="#cfd8dc" stroke-width="8"/><circle cx="130" cy="110" r="28" fill="#1565c0"/>
      <circle cx="118" cy="98" r="9" fill="#fff" opacity=".7"/><rect x="200" y="56" width="32" height="16" rx="4" fill="#ffca28"/>`,
    ),
  },
  {
    file: "gift-box.svg",
    name: "Gift box",
    group: "Celebration",
    for: ALL,
    svg: svg(
      220,
      220,
      `<rect x="20" y="90" width="180" height="120" rx="8" fill="#c0392b"/><rect x="10" y="62" width="200" height="40" rx="8" fill="#e74c3c"/>
      <rect x="96" y="62" width="28" height="148" fill="#f4d03f"/>
      <path d="M110 62 q-60 -60 -70 -10 q10 20 70 10z M110 62 q60 -60 70 -10 q-10 20 -70 10z" fill="#f4d03f"/>`,
    ),
  },
  {
    file: "candle.svg",
    name: "Candle",
    group: "Props",
    for: DECOR,
    svg: svg(
      120,
      240,
      `<path d="M60 20 q22 30 0 60 q-22 -30 0 -60z" fill="#ffb300"/><path d="M60 40 q10 18 0 34 q-10 -16 0 -34z" fill="#fff59d"/>
      <line x1="60" y1="76" x2="60" y2="92" stroke="#333" stroke-width="4"/>
      <rect x="30" y="90" width="60" height="140" rx="8" fill="#fdf2e9"/><rect x="30" y="140" width="60" height="14" fill="#c98fa0"/>`,
    ),
  },
  {
    file: "nameplate-gold.svg",
    name: "Gold name plate",
    group: "Props",
    for: DECOR,
    svg: svg(
      360,
      90,
      `<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0b25a"/><stop offset=".5" stop-color="#f7dc95"/><stop offset="1" stop-color="#a87a2c"/></linearGradient></defs>
      <rect x="4" y="4" width="352" height="82" rx="6" fill="url(#b)" stroke="#7a5a26" stroke-width="4"/>
      <rect x="16" y="14" width="328" height="62" rx="3" fill="none" stroke="#7a5a26" stroke-width="2" opacity=".6"/>`,
    ),
  },

  // ── Love & celebration ───────────────────────────────────────────────────
  {
    file: "heart.svg",
    name: "Heart",
    group: "Love",
    for: ALL,
    svg: svg(
      200,
      180,
      `<path d="M100 170 C20 110 0 70 20 40 C40 10 85 12 100 45 C115 12 160 10 180 40 C200 70 180 110 100 170z" fill="#e53950"/>
      <ellipse cx="55" cy="55" rx="16" ry="10" fill="#fff" opacity=".4" transform="rotate(-30 55 55)"/>`,
    ),
  },
  {
    file: "gingham-heart.svg",
    name: "Gingham heart",
    group: "Love",
    for: ALL,
    svg: svg(
      200,
      180,
      `<defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#dfe8f5"/><rect width="10" height="20" fill="#9fb6d6" opacity=".6"/><rect width="20" height="10" fill="#9fb6d6" opacity=".6"/></pattern></defs>
      <path d="M100 170 C20 110 0 70 20 40 C40 10 85 12 100 45 C115 12 160 10 180 40 C200 70 180 110 100 170z" fill="url(#p)" stroke="#7d93b5" stroke-width="3"/>`,
    ),
  },
  {
    file: "hearts-cluster.svg",
    name: "Floating hearts",
    group: "Love",
    for: ALL,
    svg: svg(
      240,
      200,
      ["#e53950:70:110:1", "#f48fb1:150:70:.7", "#c2185b:180:150:.55", "#ff8a80:40:40:.45"]
        .map((d) => {
          const [c, x, y, s] = d.split(":");
          return `<path transform="translate(${x} ${y}) scale(${s}) translate(-100 -95)" d="M100 170 C20 110 0 70 20 40 C40 10 85 12 100 45 C115 12 160 10 180 40 C200 70 180 110 100 170z" fill="${c}"/>`;
        })
        .join(""),
    ),
  },
  {
    file: "love-you.svg",
    name: "Love you",
    group: "Love",
    for: ALL,
    svg: svg(
      340,
      150,
      `<text x="170" y="100" text-anchor="middle" font-family="${SCRIPT}" font-size="96" fill="#c2185b">Love you</text>
      <path d="M298 40 C284 30 278 22 282 16 C286 10 294 10 298 18 C302 10 310 10 314 16 C318 22 312 30 298 40z" fill="#e53950"/>`,
    ),
  },
  {
    file: "happy-birthday.svg",
    name: "Happy Birthday banner",
    group: "Celebration",
    for: ALL,
    svg: svg(
      440,
      170,
      `<path d="M10 20 Q220 70 430 20" stroke="#795548" stroke-width="3" fill="none"/>
      ${"HAPPY".split("").map((ch, i) => {
        const x = 40 + i * 44;
        const y = 30 + Math.sin((i + 0.5) / 5 * Math.PI) * 18;
        const colors = ["#e53950", "#f4b400", "#43a047", "#1e88e5", "#8e24aa"];
        return `<path d="M${x - 18} ${y} h36 v40 l-18 14 -18 -14z" fill="${colors[i]}"/><text x="${x}" y="${y + 32}" text-anchor="middle" font-family="${SANS}" font-size="22" fill="#fff">${ch}</text>`;
      }).join("")}
      <text x="230" y="150" text-anchor="middle" font-family="${SCRIPT}" font-size="64" fill="#1e2a4a">Birthday</text>`,
    ),
  },
  {
    file: "balloons.svg",
    name: "Balloons",
    group: "Celebration",
    for: ALL,
    svg: svg(
      240,
      300,
      `<path d="M120 300 Q100 220 70 150 M120 300 Q124 210 125 120 M120 300 Q150 230 180 160" stroke="#888" stroke-width="2" fill="none"/>
      <ellipse cx="70" cy="110" rx="50" ry="62" fill="#e53950"/><ellipse cx="125" cy="72" rx="52" ry="64" fill="#1e88e5"/><ellipse cx="180" cy="120" rx="48" ry="60" fill="#f4b400"/>
      <ellipse cx="54" cy="86" rx="10" ry="18" fill="#fff" opacity=".35"/><ellipse cx="108" cy="46" rx="10" ry="18" fill="#fff" opacity=".35"/><ellipse cx="164" cy="96" rx="10" ry="18" fill="#fff" opacity=".35"/>`,
    ),
  },
  {
    file: "cake.svg",
    name: "Birthday cake",
    group: "Celebration",
    for: ALL,
    svg: svg(
      240,
      240,
      `<rect x="30" y="130" width="180" height="90" rx="10" fill="#f8bbd0"/><path d="M30 150 q22 24 45 0 q22 24 45 0 q22 24 45 0 q22 24 45 0 v-10 h-180z" fill="#fff"/>
      <rect x="60" y="80" width="120" height="56" rx="8" fill="#ce93d8"/><path d="M60 96 q15 16 30 0 q15 16 30 0 q15 16 30 0 q15 16 30 0 v-8 h-120z" fill="#fff"/>
      <rect x="114" y="44" width="12" height="38" fill="#4fc3f7"/><path d="M120 18 q12 16 0 28 q-12 -12 0 -28z" fill="#ffb300"/>
      <rect x="18" y="216" width="204" height="14" rx="7" fill="#bdbdbd"/>`,
    ),
  },
  {
    file: "crown.svg",
    name: "Crown",
    group: "Celebration",
    for: ALL,
    svg: svg(
      260,
      180,
      `<path d="M20 150 l-10 -110 70 50 50 -80 50 80 70 -50 -10 110z" fill="#f4b400" stroke="#b8860b" stroke-width="5"/>
      <rect x="18" y="140" width="224" height="30" rx="6" fill="#e0a800"/>
      <circle cx="130" cy="110" r="14" fill="#e53950"/><circle cx="70" cy="118" r="10" fill="#1e88e5"/><circle cx="190" cy="118" r="10" fill="#43a047"/>`,
    ),
  },

  // ── Floral & decoration ──────────────────────────────────────────────────
  {
    file: "rose.svg",
    name: "Red rose",
    group: "Floral",
    for: ALL,
    svg: svg(
      180,
      300,
      `<path d="M90 300 q-6 -90 0 -170" stroke="#2e7d32" stroke-width="8" fill="none"/>
      <path d="M88 220 q-40 -20 -56 -2 q24 26 56 2z M92 180 q40 -24 56 -6 q-24 26 -56 6z" fill="#43a047"/>
      <path d="M90 130 q-60 -10 -54 -60 q14 -40 54 -40 q40 0 54 40 q6 50 -54 60z" fill="#c62828"/>
      <path d="M90 118 q-36 -8 -32 -44 q10 -26 32 -26 q22 0 32 26 q4 36 -32 44z" fill="#e53935"/>
      <path d="M90 100 q-18 -6 -14 -26 q14 -10 28 0 q4 20 -14 26z" fill="#b71c1c"/>`,
    ),
  },
  {
    file: "daisy.svg",
    name: "Daisy",
    group: "Floral",
    for: ALL,
    svg: svg(
      200,
      200,
      `${Array.from({ length: 14 }, (_, i) => `<ellipse cx="100" cy="48" rx="14" ry="40" fill="#fff" stroke="#e0e0e0" stroke-width="2" transform="rotate(${(i * 360) / 14} 100 100)"/>`).join("")}
      <circle cx="100" cy="100" r="26" fill="#fbc02d"/><circle cx="100" cy="100" r="26" fill="none" stroke="#f57f17" stroke-width="4" stroke-dasharray="2 5"/>`,
    ),
  },
  {
    file: "sunflower.svg",
    name: "Sunflower",
    group: "Floral",
    for: ALL,
    svg: svg(
      220,
      220,
      `${Array.from({ length: 18 }, (_, i) => `<path d="M110 110 q-14 -50 0 -96 q14 46 0 96z" fill="${i % 2 ? "#fbc02d" : "#f9a825"}" transform="rotate(${i * 20} 110 110)"/>`).join("")}
      <circle cx="110" cy="110" r="40" fill="#5d4037"/><circle cx="110" cy="110" r="40" fill="none" stroke="#3e2723" stroke-width="6" stroke-dasharray="3 6"/>`,
    ),
  },
  {
    file: "leaf-branch.svg",
    name: "Leaf branch",
    group: "Floral",
    for: ALL,
    svg: svg(
      300,
      140,
      `<path d="M10 120 Q150 60 290 20" stroke="#558b2f" stroke-width="5" fill="none"/>
      ${[40, 80, 120, 160, 200, 240].map((x, i) => {
        const y = 120 - (x / 290) * 100 + (i % 2 ? -4 : 4);
        return `<ellipse cx="${x}" cy="${y + (i % 2 ? -18 : 18)}" rx="22" ry="9" fill="#7cb342" transform="rotate(${i % 2 ? -40 : 30} ${x} ${y})"/>`;
      }).join("")}`,
    ),
  },
  {
    file: "butterfly.svg",
    name: "Butterfly",
    group: "Floral",
    for: ALL,
    svg: svg(
      220,
      180,
      `<path d="M110 90 q-40 -80 -90 -60 q-20 40 30 70 q-40 20 -20 60 q40 10 80 -70z" fill="#7e57c2"/>
      <path d="M110 90 q40 -80 90 -60 q20 40 -30 70 q40 20 20 60 q-40 10 -80 -70z" fill="#9575cd"/>
      <circle cx="58" cy="60" r="10" fill="#fff" opacity=".6"/><circle cx="162" cy="60" r="10" fill="#fff" opacity=".6"/>
      <rect x="105" y="50" width="10" height="90" rx="5" fill="#311b92"/><path d="M110 52 q-10 -26 -24 -30 M110 52 q10 -26 24 -30" stroke="#311b92" stroke-width="3" fill="none"/>`,
    ),
  },
  {
    file: "sparkle-stars.svg",
    name: "Sparkles",
    group: "Decoration",
    for: ALL,
    svg: svg(
      200,
      200,
      `<path d="M80 20 q8 52 60 60 q-52 8 -60 60 q-8 -52 -60 -60 q52 -8 60 -60z" fill="#f4b400"/>
      <path d="M156 110 q4 26 30 30 q-26 4 -30 30 q-4 -26 -30 -30 q26 -4 30 -30z" fill="#ffd54f"/>
      <path d="M150 20 q3 17 20 20 q-17 3 -20 20 q-3 -17 -20 -20 q17 -3 20 -20z" fill="#ffe082"/>`,
    ),
  },
  {
    file: "star.svg",
    name: "Gold star",
    group: "Decoration",
    for: ALL,
    svg: svg(
      200,
      200,
      `<path d="M100 10 l26 58 62 6 -47 42 14 62 -55 -32 -55 32 14 -62 -47 -42 62 -6z" fill="#f4b400" stroke="#c68a00" stroke-width="5" stroke-linejoin="round"/>`,
    ),
  },
  {
    file: "ribbon-banner.svg",
    name: "Ribbon banner",
    group: "Decoration",
    for: ALL,
    svg: svg(
      420,
      120,
      `<path d="M10 40 h60 v60 h-60 l20 -30z" fill="#8e1b2e"/><path d="M410 40 h-60 v60 h60 l-20 -30z" fill="#8e1b2e"/>
      <rect x="50" y="20" width="320" height="64" fill="#c0392b"/><path d="M50 84 l20 16 v-16z M370 84 l-20 16 v-16z" fill="#5c0f1c"/>`,
    ),
  },
  {
    file: "bow.svg",
    name: "Bow",
    group: "Decoration",
    for: ALL,
    svg: svg(
      240,
      160,
      `<path d="M120 70 q-70 -70 -100 -20 q-10 40 100 20z M120 70 q70 -70 100 -20 q10 40 -100 20z" fill="#ec407a"/>
      <path d="M120 74 l-40 80 20 -6 20 -66z M120 74 l40 80 -20 -6 -20 -66z" fill="#d81b60"/><circle cx="120" cy="70" r="16" fill="#f06292"/>`,
    ),
  },
  {
    file: "washi-tape.svg",
    name: "Washi tape",
    group: "Decoration",
    for: ALL,
    svg: svg(
      240,
      60,
      `<path d="M6 10 l6 6 -6 6 6 6 -6 6 6 6 -6 6 h228 l-6 -6 6 -6 -6 -6 6 -6 -6 -6 6 -6z" fill="#f3d9de" opacity=".92"/>
      ${Array.from({ length: 11 }, (_, i) => `<circle cx="${24 + i * 20}" cy="30" r="5" fill="#c98fa0" opacity=".8"/>`).join("")}`,
    ),
  },

  // ── Mug quotes ───────────────────────────────────────────────────────────
  {
    file: "worlds-best-mom.svg",
    name: "World's Best Mom",
    group: "Quotes",
    for: GIFTY,
    svg: svg(
      380,
      200,
      `<text x="190" y="70" text-anchor="middle" font-family="${SANS}" font-size="38" fill="#1e2a4a">WORLD'S</text>
      <text x="190" y="140" text-anchor="middle" font-family="${SCRIPT}" font-size="88" fill="#c2185b">Best Mom</text>
      <path d="M90 168 h200" stroke="#c79a5d" stroke-width="4"/><path d="M190 188 C176 178 170 170 174 164 C178 158 186 158 190 166 C194 158 202 158 206 164 C210 170 204 178 190 188z" fill="#e53950"/>`,
    ),
  },
  {
    file: "worlds-best-dad.svg",
    name: "World's Best Dad",
    group: "Quotes",
    for: GIFTY,
    svg: svg(
      380,
      200,
      `<text x="190" y="70" text-anchor="middle" font-family="${SANS}" font-size="38" fill="#1e2a4a">WORLD'S</text>
      <text x="190" y="140" text-anchor="middle" font-family="${SCRIPT}" font-size="88" fill="#1565c0">Best Dad</text>
      <path d="M90 168 h200" stroke="#c79a5d" stroke-width="4"/>`,
    ),
  },
  {
    file: "coffee-first.svg",
    name: "But first, coffee",
    group: "Quotes",
    for: ["mugs"],
    svg: svg(
      320,
      240,
      `<text x="160" y="60" text-anchor="middle" font-family="${SERIF}" font-size="34" fill="#4e342e">But first,</text>
      <text x="160" y="140" text-anchor="middle" font-family="${SCRIPT}" font-size="86" fill="#6d4c41">coffee</text>
      <path d="M120 170 h70 v34 q0 26 -35 26 q-35 0 -35 -26z" fill="#8d6e63"/><path d="M190 180 q22 0 22 14 q0 14 -22 14" stroke="#8d6e63" stroke-width="7" fill="none"/>
      <path d="M140 160 q-8 -10 0 -20 M156 160 q-8 -10 0 -20 M172 160 q-8 -10 0 -20" stroke="#a1887f" stroke-width="4" fill="none"/>`,
    ),
  },
];

/** Starter templates: [design name, starter layout, sizes (preset keys) with prices]. */
export const STUDIO_SEED = [
  {
    slug: "3d-miniature",
    name: "3D Miniature",
    kind: "MINIATURE" as const,
    description:
      "A handmade miniature shelf scene with your photos, quotes and props — standing on a little wooden easel.",
    productSku: "DECOR-001",
    sortOrder: 1,
    designs: [
      { name: "Teacher's Day Shelf", starter: "shelves3" as const, sizes: [["6x8", 799], ["8x10", 999], ["12x16", 1499]] },
      { name: "Family Memory Shelf", starter: "shelves2" as const, sizes: [["6x8", 749], ["8x10", 949]] },
      { name: "Couple Shelf", starter: "shelf1" as const, sizes: [["6x8", 699], ["square8", 899]] },
    ],
  },
  {
    slug: "mugs",
    name: "Mugs",
    kind: "MUG" as const,
    description: "Glossy ceramic mugs printed edge to edge with your photos and words.",
    productSku: "COUPLE-001",
    sortOrder: 2,
    designs: [
      { name: "Photo & Message Mug", starter: "mug" as const, sizes: [["mug11", 399], ["mug15", 499]] },
      { name: "Photo Strip Mug", starter: "mugStrip" as const, sizes: [["mug11", 449], ["mug15", 549]] },
      { name: "Name & Quote Mug", starter: "mugName" as const, sizes: [["mug11", 349], ["mug15", 449]] },
    ],
  },
  {
    slug: "photo-frames",
    name: "Photo Frames",
    kind: "FRAME" as const,
    description: "Your favourite moments printed and framed behind glass in a real wooden frame.",
    productSku: "FRAME-002",
    sortOrder: 3,
    designs: [
      { name: "Single Photo Frame", starter: "single" as const, sizes: [["6x8", 499], ["8x10", 699], ["12x16", 999]] },
      { name: "Four Photo Collage", starter: "collage" as const, sizes: [["8x10", 799], ["12x16", 1149]] },
      { name: "Polaroid Memories", starter: "polaroid" as const, sizes: [["square8", 749], ["landscape", 849]] },
    ],
  },
  {
    slug: "flower-bouquet",
    name: "Flower Bouquet",
    kind: "CARD" as const,
    description: "Design the personalised photo card that goes with your handmade bouquet.",
    productSku: "BOUQ-003",
    sortOrder: 4,
    designs: [
      { name: "Bouquet Photo Card", starter: "card" as const, sizes: [["card4x6", 599], ["card5x7", 699]] },
      { name: "Bouquet Message Card", starter: "cardMessage" as const, sizes: [["card4x6", 549], ["card5x7", 649]] },
    ],
  },
];
