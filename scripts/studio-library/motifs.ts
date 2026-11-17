/**
 * Vector motifs for the sticker library. Each draws into its own box
 * (mostly 200 × 200) using a palette, so one motif becomes many stickers.
 * Style: soft pastel fills, rounded shapes, gentle highlights — the
 * Pinterest / planner-sticker look.
 */
import { WHITE, type Palette } from "./kit";

export interface Motif {
  id: string;
  name: string;
  group: string;
  tags: string[];
  box?: { x: number; y: number; w: number; h: number };
  /** Draw with a white die-cut sticker border. */
  dieCut?: boolean;
  /** Supports a cute face (kawaii variant). */
  face?: { cx: number; cy: number; s: number };
  draw: (p: Palette) => string;
}

const HEART = "M100 172 C40 130 12 98 16 64 C20 34 46 18 70 22 C86 25 96 36 100 46 C104 36 114 25 130 22 C154 18 180 34 184 64 C188 98 160 130 100 172 Z";
const shine = (x: number, y: number, rx: number, ry: number, rot = -30) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55" transform="rotate(${rot} ${x} ${y})"/>`;

/** Kawaii face: dot eyes, rosy cheeks, tiny smile. */
export function kawaiiFace(cx: number, cy: number, s: number, ink: string) {
  const e = s * 0.22;
  return `<g>
    <ellipse cx="${cx - e}" cy="${cy}" rx="${s * 0.055}" ry="${s * 0.07}" fill="${ink}"/>
    <ellipse cx="${cx + e}" cy="${cy}" rx="${s * 0.055}" ry="${s * 0.07}" fill="${ink}"/>
    <circle cx="${cx - e - s * 0.015}" cy="${cy - s * 0.025}" r="${s * 0.018}" fill="#fff"/>
    <circle cx="${cx + e - s * 0.015}" cy="${cy - s * 0.025}" r="${s * 0.018}" fill="#fff"/>
    <ellipse cx="${cx - e * 1.55}" cy="${cy + s * 0.11}" rx="${s * 0.075}" ry="${s * 0.045}" fill="#ff8fa3" opacity=".7"/>
    <ellipse cx="${cx + e * 1.55}" cy="${cy + s * 0.11}" rx="${s * 0.075}" ry="${s * 0.045}" fill="#ff8fa3" opacity=".7"/>
    <path d="M${cx - s * 0.07} ${cy + s * 0.08} q${s * 0.07} ${s * 0.07} ${s * 0.14} 0" stroke="${ink}" stroke-width="${s * 0.03}" fill="none" stroke-linecap="round"/>
  </g>`;
}

const petals = (cx: number, cy: number, n: number, rx: number, ry: number, dist: number, fill: string, extra = "") =>
  Array.from({ length: n }, (_, i) => `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra} transform="rotate(${(i * 360) / n} ${cx} ${cy})"/>`).join("");

const star = (cx: number, cy: number, R: number, r: number, n = 5) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};

const sparkle = (cx: number, cy: number, r: number, fill: string) =>
  `<path d="M${cx} ${cy - r} Q${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy} Q${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r} Q${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy} Q${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r}Z" fill="${fill}"/>`;

const cloudPath = "M52 150 C24 150 14 124 30 108 C24 82 50 66 72 76 C80 50 116 44 132 66 C156 56 182 74 176 100 C196 108 192 150 160 150 Z";

export const MOTIFS: Motif[] = [
  // ── Hearts ───────────────────────────────────────────────────────────────
  { id: "heart", name: "Heart", group: "Hearts", tags: ["love", "valentine"], dieCut: true, face: { cx: 100, cy: 92, s: 90 },
    draw: (p) => `<path d="${HEART}" fill="${p.accent}"/>${shine(62, 58, 16, 9)}` },
  { id: "heart-soft", name: "Soft heart", group: "Hearts", tags: ["love"], dieCut: true, face: { cx: 100, cy: 92, s: 90 },
    draw: (p) => `<path d="${HEART}" fill="${p.main}"/><path d="${HEART}" fill="none" stroke="${p.accent}" stroke-width="6" transform="translate(100 96) scale(.82) translate(-100 -96)"/>${shine(62, 58, 14, 8)}` },
  { id: "heart-gingham", name: "Gingham heart", group: "Hearts", tags: ["love", "picnic", "check"], dieCut: true,
    draw: (p) => `<defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${p.light}"/><rect width="12" height="24" fill="${p.accent}" opacity=".45"/><rect width="24" height="12" fill="${p.accent}" opacity=".45"/></pattern></defs><path d="${HEART}" fill="url(#g)"/><path d="${HEART}" fill="none" stroke="${p.accent}" stroke-width="4"/>` },
  { id: "heart-outline", name: "Doodle heart", group: "Hearts", tags: ["love", "doodle", "line"],
    draw: (p) => `<path d="${HEART}" fill="none" stroke="${p.accent}" stroke-width="9" stroke-linejoin="round"/><path d="M100 150 C58 120 36 96 40 70" fill="none" stroke="${p.main}" stroke-width="6" stroke-linecap="round"/>` },
  { id: "heart-wings", name: "Winged heart", group: "Hearts", tags: ["love", "angel", "wings"], dieCut: true, box: { x: -20, y: 20, w: 240, h: 160 },
    draw: (p) => `<path d="M40 70 C0 50 -20 90 10 104 C-10 116 14 136 40 120 C30 140 60 146 70 124Z" fill="${WHITE}" stroke="${p.accent}" stroke-width="4"/><path d="M160 70 C200 50 220 90 190 104 C210 116 186 136 160 120 C170 140 140 146 130 124Z" fill="${WHITE}" stroke="${p.accent}" stroke-width="4"/><path d="${HEART}" fill="${p.accent}" transform="translate(100 100) scale(.6) translate(-100 -96)"/>${shine(82, 80, 8, 5)}` },
  { id: "hearts-double", name: "Two hearts", group: "Hearts", tags: ["love", "couple", "together"], dieCut: true,
    draw: (p) => `<path d="${HEART}" fill="${p.main}" transform="translate(80 92) scale(.62) rotate(-14) translate(-100 -96)"/><path d="${HEART}" fill="${p.accent}" transform="translate(124 108) scale(.62) rotate(12) translate(-100 -96)"/>${shine(110, 84, 8, 5)}` },
  { id: "heart-balloon", name: "Heart balloon", group: "Hearts", tags: ["love", "balloon", "party"], dieCut: true, box: { x: 30, y: 10, w: 140, h: 190 },
    draw: (p) => `<path d="M100 140 Q90 170 104 196" stroke="${p.dark}" stroke-width="2.5" fill="none"/><path d="${HEART}" fill="${p.accent}" transform="translate(100 82) scale(.68) translate(-100 -96)"/><path d="M94 138 l12 0 -6 8z" fill="${p.accent}"/>${shine(80, 60, 10, 6)}` },
  { id: "heart-envelope", name: "Love letter", group: "Hearts", tags: ["love", "letter", "mail"], dieCut: true, box: { x: 10, y: 40, w: 180, h: 130 },
    draw: (p) => `<rect x="14" y="46" width="172" height="118" rx="10" fill="${p.light}" stroke="${p.accent}" stroke-width="5"/><path d="M18 52 L100 112 L182 52" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linejoin="round"/><path d="${HEART}" fill="${p.accent}" transform="translate(100 112) scale(.22) translate(-100 -96)"/>` },
  { id: "hearts-trio", name: "Floating hearts", group: "Hearts", tags: ["love", "cute"], dieCut: true,
    draw: (p) => `<path d="${HEART}" fill="${p.accent}" transform="translate(80 120) scale(.55) translate(-100 -96)"/><path d="${HEART}" fill="${p.main}" transform="translate(140 76) scale(.38) rotate(14) translate(-100 -96)"/><path d="${HEART}" fill="${p.pop}" transform="translate(52 52) scale(.26) rotate(-16) translate(-100 -96)"/>` },

  // ── Sky & celestial ──────────────────────────────────────────────────────
  { id: "star", name: "Star", group: "Sky", tags: ["star", "night"], dieCut: true, face: { cx: 100, cy: 108, s: 70 },
    draw: (p) => `<polygon points="${star(100, 104, 86, 42)}" fill="${p.accent}" stroke="${p.accent}" stroke-width="14" stroke-linejoin="round"/>${shine(78, 72, 10, 6)}` },
  { id: "star-outline", name: "Doodle star", group: "Sky", tags: ["star", "doodle"],
    draw: (p) => `<polygon points="${star(100, 104, 84, 40)}" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linejoin="round"/>${sparkle(168, 40, 14, p.main)}` },
  { id: "sparkle", name: "Sparkle", group: "Sky", tags: ["sparkle", "shine", "magic"], dieCut: true,
    draw: (p) => sparkle(100, 100, 86, p.accent) + shine(84, 70, 8, 5) },
  { id: "sparkles", name: "Sparkles", group: "Sky", tags: ["sparkle", "shine", "magic"], dieCut: true,
    draw: (p) => sparkle(84, 112, 66, p.accent) + sparkle(152, 52, 30, p.main) + sparkle(160, 150, 18, p.pop) },
  { id: "shooting-star", name: "Shooting star", group: "Sky", tags: ["star", "wish"], dieCut: true, box: { x: 0, y: 30, w: 200, h: 150 },
    draw: (p) => `<path d="M10 150 Q70 120 120 92" stroke="${p.main}" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M24 170 Q76 140 118 112" stroke="${p.pop}" stroke-width="8" stroke-linecap="round" fill="none"/><polygon points="${star(146, 80, 46, 22)}" fill="${p.accent}" stroke="${p.accent}" stroke-width="8" stroke-linejoin="round"/>` },
  { id: "moon", name: "Moon", group: "Sky", tags: ["moon", "night", "dream"], dieCut: true, face: { cx: 82, cy: 110, s: 60 },
    draw: (p) => `<path d="M132 30 A78 78 0 1 0 170 150 A64 64 0 1 1 132 30 Z" fill="${p.accent}"/>${shine(62, 70, 9, 16, 20)}` },
  { id: "moon-stars", name: "Moon & stars", group: "Sky", tags: ["moon", "night", "dream", "stars"], dieCut: true,
    draw: (p) => `<path d="M112 34 A70 70 0 1 0 150 146 A56 56 0 1 1 112 34 Z" fill="${p.accent}"/>${sparkle(160, 50, 18, p.pop)}${sparkle(176, 100, 10, p.main)}<polygon points="${star(146, 150, 14, 7)}" fill="${p.pop}"/>` },
  { id: "sun", name: "Sun", group: "Sky", tags: ["sun", "summer", "sunshine"], dieCut: true, face: { cx: 100, cy: 104, s: 76 },
    draw: (p) => `${Array.from({ length: 12 }, (_, i) => `<rect x="94" y="8" width="12" height="34" rx="6" fill="${p.accent}" transform="rotate(${i * 30} 100 100)"/>`).join("")}<circle cx="100" cy="100" r="56" fill="${p.main}" stroke="${p.accent}" stroke-width="6"/>` },
  { id: "cloud", name: "Cloud", group: "Sky", tags: ["cloud", "sky", "dream"], dieCut: true, face: { cx: 102, cy: 116, s: 70 }, box: { x: 10, y: 40, w: 180, h: 120 },
    draw: (p) => `<path d="${cloudPath}" fill="${p.light === "#ffffff" ? p.main : WHITE}" stroke="${p.main}" stroke-width="6"/><path d="M44 140 C34 136 32 126 38 118" stroke="${p.main}" stroke-width="5" fill="none" stroke-linecap="round"/>` },
  { id: "rain-cloud", name: "Rain cloud", group: "Sky", tags: ["cloud", "rain"], dieCut: true, face: { cx: 102, cy: 104, s: 64 }, box: { x: 10, y: 30, w: 180, h: 170 },
    draw: (p) => `<path d="${cloudPath}" fill="${p.main}" transform="translate(0 -14)"/>${[56, 92, 128, 162].map((x, i) => `<path d="M${x} ${154 + (i % 2) * 10} q-6 14 0 20 q6 -6 0 -20z" fill="${p.accent}"/>`).join("")}` },
  { id: "rainbow", name: "Rainbow", group: "Sky", tags: ["rainbow", "boho", "happy"], dieCut: true, box: { x: 0, y: 30, w: 200, h: 130 },
    draw: (p) => `${[[86, p.accent], [66, p.main], [46, p.pop]].map(([r, c]) => `<path d="M${100 - Number(r)} 150 A${r} ${r} 0 0 1 ${100 + Number(r)} 150" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round"/>`).join("")}` },
  { id: "rainbow-cloud", name: "Rainbow cloud", group: "Sky", tags: ["rainbow", "cloud", "happy"], dieCut: true, box: { x: 0, y: 20, w: 200, h: 160 },
    draw: (p) => `${[[78, p.accent], [58, p.main], [38, p.pop]].map(([r, c]) => `<path d="M${100 - Number(r)} 130 A${r} ${r} 0 0 1 ${100 + Number(r)} 130" fill="none" stroke="${c}" stroke-width="18" stroke-linecap="round"/>`).join("")}<path d="M10 150 C0 126 24 110 40 122 C46 100 76 104 78 124 C86 140 70 164 40 164 C22 166 14 160 10 150Z" fill="${WHITE}" stroke="${p.main}" stroke-width="4"/><path d="M190 150 C200 126 176 110 160 122 C154 100 124 104 122 124 C114 140 130 164 160 164 C178 166 186 160 190 150Z" fill="${WHITE}" stroke="${p.main}" stroke-width="4"/>` },
  { id: "planet", name: "Planet", group: "Sky", tags: ["space", "planet"], dieCut: true, face: { cx: 100, cy: 102, s: 60 },
    draw: (p) => `<ellipse cx="100" cy="100" rx="94" ry="26" fill="none" stroke="${p.accent}" stroke-width="10" transform="rotate(-18 100 100)"/><circle cx="100" cy="100" r="54" fill="${p.main}"/><path d="M8 118 A94 26 0 0 0 192 82" fill="none" stroke="${p.accent}" stroke-width="10" transform="rotate(-18 100 100)"/>${shine(80, 76, 10, 6)}` },

  // ── Florals & greenery ───────────────────────────────────────────────────
  { id: "daisy", name: "Daisy", group: "Florals", tags: ["flower", "daisy", "spring"], dieCut: true,
    draw: (p) => `${petals(100, 100, 12, 17, 40, 50, WHITE, `stroke="${p.main}" stroke-width="3"`)}<circle cx="100" cy="100" r="30" fill="${p.pop === "#ffd66b" ? p.pop : "#ffd66b"}"/><circle cx="100" cy="100" r="30" fill="none" stroke="#f0b429" stroke-width="3" stroke-dasharray="2 6"/>` },
  { id: "flower", name: "Blossom", group: "Florals", tags: ["flower", "spring", "cute"], dieCut: true, face: { cx: 100, cy: 102, s: 44 },
    draw: (p) => `${petals(100, 100, 5, 34, 40, 44, p.main)}${petals(100, 100, 5, 18, 22, 44, WHITE, 'opacity=".35"')}<circle cx="100" cy="100" r="30" fill="${p.pop}"/>` },
  { id: "tulip", name: "Tulip", group: "Florals", tags: ["flower", "tulip", "spring"], dieCut: true, box: { x: 40, y: 10, w: 120, h: 190 },
    draw: (p) => `<path d="M100 196 V96" stroke="#6aa84f" stroke-width="7" stroke-linecap="round"/><path d="M100 170 C70 160 62 132 66 116 C86 124 96 144 100 170Z" fill="#8bc47a"/><path d="M100 150 C130 140 138 112 134 96 C114 104 104 124 100 150Z" fill="#8bc47a"/><path d="M60 40 C58 76 72 100 100 100 C128 100 142 76 140 40 C126 52 116 52 100 26 C84 52 74 52 60 40Z" fill="${p.accent}"/><path d="M100 26 C92 44 92 72 100 100" stroke="${p.dark}" stroke-width="2" fill="none" opacity=".25"/>` },
  { id: "rose", name: "Rose", group: "Florals", tags: ["flower", "rose", "love"], dieCut: true,
    draw: (p) => `<path d="M40 150 C20 130 40 110 60 120" fill="#8bc47a"/><path d="M160 150 C180 130 160 110 140 120" fill="#8bc47a"/><circle cx="100" cy="100" r="66" fill="${p.accent}"/><path d="M100 46 C140 46 154 80 140 108 C126 136 80 138 66 110 C54 84 76 64 100 66 C120 68 126 90 112 102 C100 112 84 104 88 92" fill="none" stroke="${p.dark}" stroke-width="5" stroke-linecap="round" opacity=".55"/>${shine(70, 70, 10, 6)}` },
  { id: "cherry-blossom", name: "Cherry blossom", group: "Florals", tags: ["flower", "sakura", "spring"], dieCut: true,
    draw: (p) => `${Array.from({ length: 5 }, (_, i) => `<path d="M100 100 C76 70 78 34 100 30 C108 40 108 40 100 46 C108 40 116 32 122 40 C126 68 120 84 100 100Z" fill="${p.main}" stroke="${p.accent}" stroke-width="3" transform="rotate(${i * 72} 100 100)"/>`).join("")}<circle cx="100" cy="100" r="12" fill="${p.accent}"/>${Array.from({ length: 5 }, (_, i) => `<circle cx="100" cy="76" r="3.5" fill="${p.dark}" transform="rotate(${i * 72 + 36} 100 100)"/>`).join("")}` },
  { id: "sunflower", name: "Sunflower", group: "Florals", tags: ["flower", "sunflower", "summer"], dieCut: true, face: { cx: 100, cy: 102, s: 50 },
    draw: () => `${petals(100, 100, 16, 13, 38, 56, "#f7c948")}${petals(100, 100, 16, 9, 26, 52, "#ffdd6e", 'transform-origin="100 100"')}<circle cx="100" cy="100" r="38" fill="#7a4b2a"/><circle cx="100" cy="100" r="38" fill="none" stroke="#5a3519" stroke-width="5" stroke-dasharray="3 7"/>` },
  { id: "lavender", name: "Lavender sprig", group: "Florals", tags: ["flower", "lavender", "botanical"], box: { x: 50, y: 0, w: 100, h: 200 },
    draw: (p) => `<path d="M100 198 Q96 120 100 30" stroke="#7ea86a" stroke-width="5" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${100 + (i % 2 ? 10 : -10)}" cy="${40 + i * 12}" rx="9" ry="13" fill="${i % 3 ? p.accent : p.main}" transform="rotate(${i % 2 ? 24 : -24} ${100 + (i % 2 ? 10 : -10)} ${40 + i * 12})"/>`).join("")}` },
  { id: "wildflowers", name: "Wildflower bunch", group: "Florals", tags: ["flower", "bouquet", "botanical"], dieCut: true, box: { x: 20, y: 0, w: 160, h: 200 },
    draw: (p) => `${[[60, 60], [100, 36], [140, 64], [80, 96], [124, 100]].map(([x, y]) => `<path d="M100 196 Q${(x + 100) / 2} ${(y + 196) / 2} ${x} ${y}" stroke="#7ea86a" stroke-width="4" fill="none"/>`).join("")}${[[60, 60, p.accent], [100, 36, p.main], [140, 64, p.pop], [80, 96, p.main], [124, 100, p.accent]].map(([x, y, c]) => `${petals(Number(x), Number(y), 6, 7, 11, 11, String(c))}<circle cx="${x}" cy="${y}" r="6" fill="#ffd66b"/>`).join("")}<path d="M70 168 L100 150 L130 168 L118 198 L82 198Z" fill="${p.light}" stroke="${p.accent}" stroke-width="3"/>` },
  { id: "leaf", name: "Leaf", group: "Florals", tags: ["leaf", "botanical", "green", "nature"], dieCut: true,
    draw: () => `<path d="M30 170 C30 80 90 24 176 24 C176 110 120 170 30 170Z" fill="#9cc98a"/><path d="M36 164 Q100 100 166 34" stroke="#5f8f4e" stroke-width="5" fill="none" stroke-linecap="round"/>${[60, 90, 120].map((t) => `<path d="M${t} ${200 - t} q${18} -2 30 -22" stroke="#5f8f4e" stroke-width="3" fill="none"/>`).join("")}` },
  { id: "branch", name: "Leafy branch", group: "Florals", tags: ["leaf", "botanical", "greenery"], box: { x: 0, y: 30, w: 200, h: 140 },
    draw: (p) => `<path d="M6 160 Q100 110 194 40" stroke="${p.dark}" stroke-width="4" fill="none" opacity=".7"/>${[30, 60, 90, 120, 150, 176].map((x, i) => { const y = 160 - (x / 194) * 120; return `<ellipse cx="${x}" cy="${y + (i % 2 ? -16 : 16)}" rx="20" ry="9" fill="${i % 2 ? "#a7c896" : "#8bbd7a"}" transform="rotate(${i % 2 ? -50 : 30} ${x} ${y})"/>`; }).join("")}` },
  { id: "eucalyptus", name: "Eucalyptus", group: "Florals", tags: ["eucalyptus", "botanical", "greenery"], box: { x: 40, y: 0, w: 120, h: 200 },
    draw: () => `<path d="M100 198 Q108 100 96 6" stroke="#6b8f7a" stroke-width="4" fill="none"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${100 + (i % 2 ? 22 : -22)}" cy="${24 + i * 22}" r="${15 - i * 0.4}" fill="#9db9a8" stroke="#7f9e8c" stroke-width="2"/>`).join("")}` },
  { id: "mushroom", name: "Mushroom", group: "Florals", tags: ["mushroom", "cottagecore", "cute"], dieCut: true, face: { cx: 100, cy: 140, s: 46 },
    draw: (p) => `<path d="M70 110 L74 180 Q100 192 126 180 L130 110Z" fill="#fff4e3"/><path d="M14 112 C14 46 60 20 100 20 C140 20 186 46 186 112 Q100 128 14 112Z" fill="${p.accent}"/>${[[60, 64, 13], [104, 46, 10], [146, 72, 14], [94, 92, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join("")}` },
  { id: "cactus", name: "Cactus", group: "Florals", tags: ["cactus", "plant", "desert"], dieCut: true, face: { cx: 100, cy: 92, s: 50 }, box: { x: 20, y: 10, w: 160, h: 190 },
    draw: (p) => `<path d="M70 150 V60 a30 30 0 0 1 60 0 V150Z" fill="#8cc084"/><path d="M70 110 H50 a18 18 0 0 1 -18 -18 V76 a10 10 0 0 1 20 0 V90 H70" fill="#8cc084"/><path d="M130 96 H150 V70 a10 10 0 0 1 20 0 V86 a28 28 0 0 1 -28 28 H130" fill="#8cc084"/><path d="M52 146 H148 L136 196 H64Z" fill="${p.accent}"/><rect x="46" y="140" width="108" height="16" rx="6" fill="${p.main}"/>${sparkle(100, 30, 10, p.pop)}` },
  { id: "potted-plant", name: "Potted plant", group: "Florals", tags: ["plant", "home", "decor"], dieCut: true, box: { x: 20, y: 0, w: 160, h: 200 },
    draw: (p) => `<path d="M100 120 C60 110 40 70 50 40 C80 48 98 80 100 120Z" fill="#8bbd7a"/><path d="M100 120 C140 110 162 72 150 38 C120 50 102 82 100 120Z" fill="#a7c896"/><path d="M100 124 C96 80 100 40 112 10 C124 40 116 90 100 124Z" fill="#7aaa68"/><path d="M58 120 H142 L130 196 H70Z" fill="${p.accent}"/><rect x="52" y="114" width="96" height="18" rx="7" fill="${p.main}"/>` },
  { id: "bouquet", name: "Bouquet", group: "Florals", tags: ["bouquet", "flowers", "gift"], dieCut: true, box: { x: 10, y: 0, w: 180, h: 200 },
    draw: (p) => `<path d="M60 110 L100 196 L140 110Z" fill="${p.light}" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round"/>${[[64, 70, p.accent], [100, 50, p.main], [136, 72, p.accent], [100, 90, p.pop], [76, 104, p.main], [124, 104, p.main]].map(([x, y, c]) => `${petals(Number(x), Number(y), 5, 12, 14, 14, String(c))}<circle cx="${x}" cy="${y}" r="8" fill="#fff6d0"/>`).join("")}<path d="M86 160 q14 -10 28 0 q-14 10 -28 0z" fill="${p.accent}"/><path d="M100 160 l-12 26 M100 160 l12 26" stroke="${p.accent}" stroke-width="4"/>` },

  // ── Cute critters & bows ─────────────────────────────────────────────────
  { id: "bow", name: "Bow", group: "Cute", tags: ["bow", "ribbon", "coquette"], dieCut: true, box: { x: 0, y: 30, w: 200, h: 150 },
    draw: (p) => `<path d="M100 92 C70 50 20 40 16 70 C12 100 60 112 100 96Z" fill="${p.main}" stroke="${p.accent}" stroke-width="4"/><path d="M100 92 C130 50 180 40 184 70 C188 100 140 112 100 96Z" fill="${p.main}" stroke="${p.accent}" stroke-width="4"/><path d="M96 100 L66 172 L84 166 L92 182 L104 104Z M104 100 L134 172 L116 166 L108 182 L96 104Z" fill="${p.main}" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="100" cy="94" rx="16" ry="14" fill="${p.accent}"/>` },
  { id: "butterfly", name: "Butterfly", group: "Cute", tags: ["butterfly", "spring", "garden"], dieCut: true,
    draw: (p) => `<path d="M100 96 C80 30 24 26 20 60 C16 92 60 104 100 100Z" fill="${p.main}"/><path d="M100 96 C120 30 176 26 180 60 C184 92 140 104 100 100Z" fill="${p.main}"/><path d="M100 104 C70 110 40 140 56 160 C74 176 96 140 100 108Z" fill="${p.accent}"/><path d="M100 104 C130 110 160 140 144 160 C126 176 104 140 100 108Z" fill="${p.accent}"/><circle cx="56" cy="64" r="10" fill="#fff" opacity=".7"/><circle cx="144" cy="64" r="10" fill="#fff" opacity=".7"/><rect x="94" y="70" width="12" height="80" rx="6" fill="${p.dark}"/><path d="M100 72 q-10 -26 -26 -32 M100 72 q10 -26 26 -32" stroke="${p.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  { id: "bee", name: "Bee", group: "Cute", tags: ["bee", "honey", "spring"], dieCut: true, face: { cx: 82, cy: 110, s: 46 },
    draw: () => `<ellipse cx="80" cy="56" rx="24" ry="34" fill="#e8f6ff" stroke="#bfe0f5" stroke-width="3" transform="rotate(-20 80 56)"/><ellipse cx="118" cy="56" rx="24" ry="34" fill="#e8f6ff" stroke="#bfe0f5" stroke-width="3" transform="rotate(20 118 56)"/><ellipse cx="100" cy="116" rx="66" ry="52" fill="#ffd54f"/><path d="M110 70 q10 46 0 92 M138 78 q10 38 0 76" stroke="#4a3b2a" stroke-width="13" fill="none"/><path d="M164 116 l18 -4 -16 12z" fill="#4a3b2a"/>` },
  { id: "ladybug", name: "Ladybug", group: "Cute", tags: ["ladybug", "garden", "luck"], dieCut: true,
    draw: () => `<circle cx="100" cy="56" r="28" fill="#3a3a3a"/><circle cx="100" cy="112" r="66" fill="#ef5350"/><path d="M100 46 V178" stroke="#3a3a3a" stroke-width="5"/>${[[70, 96, 12], [130, 96, 12], [64, 140, 10], [136, 140, 10], [100, 160, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a3a3a"/>`).join("")}${shine(72, 78, 10, 6)}` },
  { id: "bunny", name: "Bunny", group: "Cute", tags: ["bunny", "rabbit", "easter", "animal"], dieCut: true, face: { cx: 100, cy: 128, s: 70 },
    draw: (p) => `<ellipse cx="70" cy="56" rx="18" ry="48" fill="${WHITE}" stroke="${p.main}" stroke-width="4"/><ellipse cx="70" cy="60" rx="8" ry="32" fill="${p.main}"/><ellipse cx="130" cy="56" rx="18" ry="48" fill="${WHITE}" stroke="${p.main}" stroke-width="4"/><ellipse cx="130" cy="60" rx="8" ry="32" fill="${p.main}"/><ellipse cx="100" cy="132" rx="72" ry="58" fill="${WHITE}" stroke="${p.main}" stroke-width="4"/>` },
  { id: "kitty", name: "Kitty", group: "Cute", tags: ["cat", "kitty", "animal", "pet"], dieCut: true, face: { cx: 100, cy: 116, s: 74 },
    draw: (p) => `<path d="M30 70 L46 14 L84 50Z M170 70 L154 14 L116 50Z" fill="${p.main}" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="100" cy="112" rx="78" ry="66" fill="${p.main}" stroke="${p.accent}" stroke-width="4"/><path d="M18 118 h34 M20 132 h32 M148 118 h34 M148 132 h32" stroke="${p.dark}" stroke-width="3" stroke-linecap="round" opacity=".5"/>` },
  { id: "bear", name: "Teddy bear", group: "Cute", tags: ["bear", "teddy", "animal"], dieCut: true, face: { cx: 100, cy: 104, s: 66 },
    draw: (p) => `<circle cx="44" cy="50" r="26" fill="${p.accent}"/><circle cx="156" cy="50" r="26" fill="${p.accent}"/><circle cx="44" cy="50" r="12" fill="${p.main}"/><circle cx="156" cy="50" r="12" fill="${p.main}"/><ellipse cx="100" cy="110" rx="80" ry="72" fill="${p.accent}"/><ellipse cx="100" cy="134" rx="32" ry="22" fill="${p.light}"/>` },
  { id: "paw", name: "Paw print", group: "Cute", tags: ["paw", "pet", "dog", "cat"], dieCut: true,
    draw: (p) => `<path d="M100 96 C66 96 44 130 52 156 C60 180 86 168 100 168 C114 168 140 180 148 156 C156 130 134 96 100 96Z" fill="${p.accent}"/>${[[46, 84, 17], [78, 50, 18], [122, 50, 18], [154, 84, 17]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${Number(r) * 1.2}" fill="${p.accent}"/>`).join("")}` },

  // ── Food & treats ────────────────────────────────────────────────────────
  { id: "strawberry", name: "Strawberry", group: "Treats", tags: ["strawberry", "fruit", "summer"], dieCut: true, face: { cx: 100, cy: 118, s: 64 },
    draw: () => `<path d="M100 186 C50 160 22 110 34 76 C46 46 86 52 100 60 C114 52 154 46 166 76 C178 110 150 160 100 186Z" fill="#f2545b"/>${[[64, 96], [100, 92], [136, 96], [80, 128], [120, 128], [100, 156], [56, 124], [144, 124]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="5" fill="#ffe08a"/>`).join("")}<path d="M100 64 L70 40 L92 46 L100 22 L108 46 L130 40Z" fill="#6cbf5c"/>` },
  { id: "cherries", name: "Cherries", group: "Treats", tags: ["cherry", "fruit", "retro"], dieCut: true,
    draw: () => `<path d="M70 130 Q80 60 128 28 M136 128 Q126 70 128 28" stroke="#6a8f3b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M128 28 C148 18 172 28 176 44 C156 52 138 44 128 28Z" fill="#7cbf5a"/><circle cx="68" cy="146" r="36" fill="#e5383b"/><circle cx="138" cy="146" r="36" fill="#d62828"/>${shine(56, 132, 9, 6)}${shine(126, 132, 9, 6)}` },
  { id: "lemon", name: "Lemon slice", group: "Treats", tags: ["lemon", "citrus", "summer"], dieCut: true,
    draw: () => `<circle cx="100" cy="100" r="84" fill="#f7d13d"/><circle cx="100" cy="100" r="72" fill="#fff7c2"/>${Array.from({ length: 8 }, (_, i) => `<path d="M100 100 L${100 + 64 * Math.cos((i * Math.PI) / 4 + 0.15)} ${100 + 64 * Math.sin((i * Math.PI) / 4 + 0.15)} A64 64 0 0 1 ${100 + 64 * Math.cos(((i + 1) * Math.PI) / 4 - 0.15)} ${100 + 64 * Math.sin(((i + 1) * Math.PI) / 4 - 0.15)}Z" fill="#fbe26a"/>`).join("")}<circle cx="100" cy="100" r="8" fill="#fff7c2"/>` },
  { id: "orange", name: "Orange slice", group: "Treats", tags: ["orange", "citrus", "summer"], dieCut: true,
    draw: () => `<circle cx="100" cy="100" r="84" fill="#f8961e"/><circle cx="100" cy="100" r="72" fill="#ffe1b0"/>${Array.from({ length: 10 }, (_, i) => `<path d="M100 100 L${100 + 64 * Math.cos((i * Math.PI) / 5 + 0.12)} ${100 + 64 * Math.sin((i * Math.PI) / 5 + 0.12)} A64 64 0 0 1 ${100 + 64 * Math.cos(((i + 1) * Math.PI) / 5 - 0.12)} ${100 + 64 * Math.sin(((i + 1) * Math.PI) / 5 - 0.12)}Z" fill="#fbb15f"/>`).join("")}` },
  { id: "cupcake", name: "Cupcake", group: "Treats", tags: ["cupcake", "birthday", "dessert"], dieCut: true, face: { cx: 100, cy: 150, s: 50 },
    draw: (p) => `<path d="M46 116 H154 L140 192 H60Z" fill="${p.main}"/>${[64, 84, 104, 124, 140].map((x) => `<path d="M${x} 118 L${x + (x < 100 ? 4 : -4)} 190" stroke="${p.accent}" stroke-width="4"/>`).join("")}<path d="M38 120 C20 120 24 92 46 92 C40 64 76 56 84 70 C88 44 126 44 128 68 C144 56 172 72 160 94 C182 96 180 122 162 122Z" fill="#fff6f0" stroke="${p.main}" stroke-width="3"/><circle cx="100" cy="46" r="14" fill="#e5383b"/>${[[70, 100, "#7cc6fe"], [118, 84, "#ffd166"], [140, 106, "#8bd3a8"], [92, 76, "#ff8fab"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="12" height="4" rx="2" fill="${c}" transform="rotate(30 ${x} ${y})"/>`).join("")}` },
  { id: "donut", name: "Donut", group: "Treats", tags: ["donut", "dessert", "sweet"], dieCut: true, face: { cx: 100, cy: 136, s: 46 },
    draw: (p) => `<circle cx="100" cy="100" r="86" fill="#e8b27d"/><path d="M100 22 C150 22 180 56 180 92 C176 112 160 104 150 120 C140 140 120 128 100 140 C80 128 60 140 50 120 C40 104 24 112 20 92 C20 56 50 22 100 22Z" fill="${p.accent}"/><circle cx="100" cy="94" r="24" fill="#fff"/>${[[56, 60], [80, 44], [130, 50], [150, 78], [60, 96], [140, 112], [104, 52]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="12" height="4" rx="2" fill="${["#fff", "#ffd166", "#7cc6fe", "#8bd3a8"][i % 4]}" transform="rotate(${i * 50} ${x} ${y})"/>`).join("")}` },
  { id: "ice-cream", name: "Ice cream", group: "Treats", tags: ["ice cream", "summer", "dessert"], dieCut: true, face: { cx: 100, cy: 72, s: 56 }, box: { x: 30, y: 0, w: 140, h: 200 },
    draw: (p) => `<path d="M58 100 L100 196 L142 100Z" fill="#e8b27d"/><path d="M68 112 L132 112 M74 128 L126 128 M82 146 L118 146" stroke="#c98d56" stroke-width="4"/><circle cx="100" cy="72" r="50" fill="${p.main}"/><path d="M52 92 C60 110 76 100 80 112 C90 104 100 118 110 108 C118 116 132 104 148 92Z" fill="${p.main}"/><circle cx="100" cy="20" r="12" fill="#e5383b"/>` },
  { id: "coffee", name: "Coffee", group: "Treats", tags: ["coffee", "cafe", "latte"], dieCut: true, face: { cx: 92, cy: 132, s: 56 },
    draw: (p) => `<path d="M42 80 H142 L132 180 Q92 196 52 180Z" fill="${p.main}"/><path d="M142 100 C176 100 176 150 136 150" stroke="${p.main}" stroke-width="13" fill="none"/><ellipse cx="92" cy="80" rx="50" ry="12" fill="#a0673e"/><path d="M78 56 q-10 -14 0 -26 q10 -12 0 -24 M104 56 q-10 -14 0 -26 q10 -12 0 -24" stroke="#cfc6bb" stroke-width="5" fill="none" stroke-linecap="round"/>` },
  { id: "boba", name: "Boba tea", group: "Treats", tags: ["boba", "bubble tea", "drink"], dieCut: true, face: { cx: 100, cy: 120, s: 50 }, box: { x: 30, y: 0, w: 140, h: 200 },
    draw: (p) => `<rect x="112" y="4" width="12" height="70" rx="5" fill="${p.accent}" transform="rotate(14 118 40)"/><path d="M50 60 H150 L138 192 H62Z" fill="${p.main}" opacity=".95"/><ellipse cx="100" cy="60" rx="54" ry="16" fill="${p.light}" stroke="${p.accent}" stroke-width="4"/>${[[74, 168], [96, 176], [118, 168], [86, 152], [110, 152], [128, 180], [70, 182]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#4a3528"/>`).join("")}` },
  { id: "teacup", name: "Teacup", group: "Treats", tags: ["tea", "cottagecore", "cup"], dieCut: true, face: { cx: 92, cy: 112, s: 46 }, box: { x: 0, y: 40, w: 200, h: 140 },
    draw: (p) => `<ellipse cx="96" cy="170" rx="84" ry="14" fill="${p.main}" stroke="${p.accent}" stroke-width="3"/><path d="M32 78 H160 Q156 160 96 164 Q36 160 32 78Z" fill="${WHITE}" stroke="${p.accent}" stroke-width="4"/><path d="M158 94 C190 92 192 134 150 136" stroke="${p.accent}" stroke-width="8" fill="none"/>${[[60, 104], [96, 96], [132, 104]].map(([x, y]) => `${petals(x, y, 5, 5, 7, 7, p.main)}`).join("")}` },
  { id: "cookie", name: "Cookie", group: "Treats", tags: ["cookie", "bake", "sweet"], dieCut: true, face: { cx: 100, cy: 104, s: 56 },
    draw: () => `<circle cx="100" cy="100" r="82" fill="#e2a868"/><circle cx="100" cy="100" r="82" fill="none" stroke="#c98a4b" stroke-width="5"/>${[[58, 64], [130, 56], [146, 112], [70, 140], [112, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="7" fill="#5a3825"/>`).join("")}` },
  { id: "cake-slice", name: "Cake slice", group: "Treats", tags: ["cake", "birthday", "dessert"], dieCut: true, box: { x: 10, y: 20, w: 180, h: 170 },
    draw: (p) => `<path d="M20 110 L170 64 L180 160 L28 180Z" fill="#fff3e0"/><path d="M24 140 L176 112" stroke="${p.accent}" stroke-width="10"/><path d="M20 110 L170 64 L174 86 Q150 96 130 90 Q110 104 90 100 Q70 112 50 108 Q34 120 22 118Z" fill="${p.main}"/><circle cx="150" cy="56" r="14" fill="#e5383b"/>` },

  // ── Celebration ──────────────────────────────────────────────────────────
  { id: "balloon", name: "Balloon", group: "Celebration", tags: ["balloon", "party", "birthday"], dieCut: true, box: { x: 40, y: 0, w: 120, h: 200 },
    draw: (p) => `<path d="M100 148 Q90 172 104 198" stroke="${p.dark}" stroke-width="2.5" fill="none"/><ellipse cx="100" cy="76" rx="54" ry="68" fill="${p.accent}"/><path d="M92 142 h16 l-8 10z" fill="${p.accent}"/>${shine(78, 46, 10, 18, 20)}` },
  { id: "balloons", name: "Balloons", group: "Celebration", tags: ["balloon", "party", "birthday"], dieCut: true,
    draw: (p) => `<path d="M100 196 Q80 150 60 110 M100 196 Q102 140 104 92 M100 196 Q122 150 146 116" stroke="${p.dark}" stroke-width="2" fill="none"/><ellipse cx="58" cy="74" rx="40" ry="48" fill="${p.main}"/><ellipse cx="146" cy="80" rx="38" ry="46" fill="${p.pop}"/><ellipse cx="104" cy="52" rx="42" ry="50" fill="${p.accent}"/>${shine(90, 30, 7, 13, 20)}${shine(46, 54, 6, 11, 20)}${shine(134, 60, 6, 11, 20)}` },
  { id: "gift", name: "Gift", group: "Celebration", tags: ["gift", "present", "birthday"], dieCut: true, face: { cx: 100, cy: 138, s: 50 },
    draw: (p) => `<rect x="28" y="84" width="144" height="104" rx="10" fill="${p.main}"/><rect x="18" y="62" width="164" height="34" rx="9" fill="${p.accent}"/><rect x="90" y="62" width="20" height="126" fill="${p.pop}"/><path d="M100 62 C70 20 40 34 56 56 C64 66 86 64 100 62 C114 64 136 66 144 56 C160 34 130 20 100 62Z" fill="${p.pop}"/>` },
  { id: "party-hat", name: "Party hat", group: "Celebration", tags: ["party", "birthday", "hat"], dieCut: true, box: { x: 30, y: 0, w: 140, h: 200 },
    draw: (p) => `<path d="M100 24 L156 182 Q100 198 44 182Z" fill="${p.main}"/><path d="M80 80 L118 70 M66 120 L132 104 M54 156 L146 140" stroke="${p.accent}" stroke-width="10" stroke-linecap="round"/><circle cx="100" cy="22" r="16" fill="${p.pop}"/>` },
  { id: "confetti", name: "Confetti", group: "Celebration", tags: ["confetti", "party", "celebrate"],
    draw: (p) => Array.from({ length: 22 }, (_, i) => { const x = 20 + ((i * 53) % 160); const y = 20 + ((i * 37) % 160); const c = [p.accent, p.main, p.pop, p.dark][i % 4]; return i % 3 === 0 ? `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>` : i % 3 === 1 ? `<rect x="${x}" y="${y}" width="16" height="6" rx="3" fill="${c}" transform="rotate(${i * 40} ${x} ${y})"/>` : `<path d="M${x} ${y} q6 -8 12 0 q6 8 12 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`; }).join("") },
  { id: "candle", name: "Candle", group: "Celebration", tags: ["candle", "birthday", "cozy"], dieCut: true, box: { x: 50, y: 0, w: 100, h: 200 },
    draw: (p) => `<path d="M100 14 C118 40 118 58 100 66 C82 58 82 40 100 14Z" fill="#ffb703"/><path d="M100 34 C108 46 108 54 100 60 C92 54 92 46 100 34Z" fill="#fff3b0"/><rect x="78" y="70" width="44" height="124" rx="8" fill="${p.main}"/>${[90, 116, 142, 168].map((y) => `<path d="M78 ${y} L122 ${y - 14}" stroke="${p.accent}" stroke-width="7"/>`).join("")}` },
  { id: "crown", name: "Crown", group: "Celebration", tags: ["crown", "queen", "princess"], dieCut: true, box: { x: 0, y: 30, w: 200, h: 150 },
    draw: (p) => `<path d="M20 160 L10 60 L60 100 L100 40 L140 100 L190 60 L180 160Z" fill="#f7cf4f" stroke="#e0a800" stroke-width="5" stroke-linejoin="round"/><rect x="18" y="150" width="164" height="26" rx="8" fill="#f2c12e"/><circle cx="100" cy="122" r="12" fill="${p.accent}"/><circle cx="56" cy="128" r="8" fill="${p.main}"/><circle cx="144" cy="128" r="8" fill="${p.main}"/>` },
  { id: "music", name: "Music notes", group: "Celebration", tags: ["music", "song", "notes"], dieCut: true,
    draw: (p) => `<path d="M70 150 V50 L160 30 V130" stroke="${p.accent}" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M70 50 L160 30 V56 L70 76Z" fill="${p.accent}"/><ellipse cx="56" cy="152" rx="22" ry="17" fill="${p.accent}" transform="rotate(-20 56 152)"/><ellipse cx="146" cy="132" rx="22" ry="17" fill="${p.accent}" transform="rotate(-20 146 132)"/>` },
  { id: "camera", name: "Camera", group: "Celebration", tags: ["camera", "memories", "photo", "travel"], dieCut: true, box: { x: 0, y: 30, w: 200, h: 150 },
    draw: (p) => `<rect x="10" y="60" width="180" height="116" rx="20" fill="${p.main}"/><rect x="62" y="40" width="58" height="28" rx="8" fill="${p.accent}"/><circle cx="100" cy="118" r="44" fill="${p.light}" stroke="${p.accent}" stroke-width="8"/><circle cx="100" cy="118" r="24" fill="${p.dark}"/><circle cx="90" cy="108" r="7" fill="#fff" opacity=".8"/><rect x="152" y="74" width="24" height="12" rx="4" fill="${p.pop}"/>` },
  { id: "diamond", name: "Diamond", group: "Celebration", tags: ["diamond", "gem", "sparkle"], dieCut: true,
    draw: (p) => `<path d="M40 70 L70 34 H130 L160 70 L100 170Z" fill="${p.main}" stroke="${p.accent}" stroke-width="5" stroke-linejoin="round"/><path d="M40 70 H160 M70 34 L84 70 L100 170 L116 70 L130 34" stroke="${p.accent}" stroke-width="4" fill="none" stroke-linejoin="round"/>${sparkle(162, 34, 14, p.pop)}` },

  // ── Paper & planner ──────────────────────────────────────────────────────
  { id: "polaroid", name: "Polaroid", group: "Paper", tags: ["polaroid", "photo", "frame", "memories"], box: { x: 20, y: 0, w: 160, h: 200 },
    draw: (p) => `<rect x="26" y="10" width="148" height="182" rx="4" fill="${WHITE}" stroke="#e6e0d8" stroke-width="3"/><rect x="38" y="22" width="124" height="124" fill="${p.main}"/><path d="M38 120 L80 84 L110 112 L130 96 L162 126 V146 H38Z" fill="${p.accent}" opacity=".6"/><circle cx="128" cy="52" r="12" fill="${p.light}"/><rect x="80" y="2" width="44" height="18" rx="2" fill="${p.pop}" opacity=".8" transform="rotate(-6 102 11)"/>` },
  { id: "stamp", name: "Postage stamp", group: "Paper", tags: ["stamp", "mail", "vintage"], box: { x: 20, y: 10, w: 160, h: 180 },
    draw: (p) => `<rect x="24" y="14" width="152" height="172" fill="${WHITE}"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${24 + i * 19}" cy="14" r="5" fill="#000" opacity="0"/>`).join("")}<rect x="24" y="14" width="152" height="172" fill="none" stroke="${WHITE}" stroke-width="12" stroke-dasharray="0.1 14" stroke-linecap="round"/><rect x="38" y="28" width="124" height="144" fill="${p.main}"/><path d="${HEART}" fill="${p.accent}" transform="translate(100 96) scale(.45) translate(-100 -96)"/><rect x="38" y="28" width="124" height="144" fill="none" stroke="${p.accent}" stroke-width="3"/>` },
  { id: "envelope", name: "Envelope", group: "Paper", tags: ["mail", "letter", "note"], dieCut: true, box: { x: 10, y: 40, w: 180, h: 130 },
    draw: (p) => `<rect x="14" y="46" width="172" height="118" rx="8" fill="${p.main}"/><path d="M14 54 L100 116 L186 54" fill="${p.light}" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round"/><circle cx="100" cy="114" r="14" fill="${p.accent}"/>` },
  { id: "ticket", name: "Ticket", group: "Paper", tags: ["ticket", "admit one", "date", "travel"], dieCut: true, box: { x: 0, y: 50, w: 200, h: 100 },
    draw: (p) => `<path d="M6 56 H194 V82 A16 16 0 0 0 194 118 V144 H6 V118 A16 16 0 0 0 6 82Z" fill="${p.main}"/><path d="M150 60 V140" stroke="${p.accent}" stroke-width="3" stroke-dasharray="6 6"/><rect x="22" y="72" width="112" height="56" rx="4" fill="none" stroke="${p.accent}" stroke-width="3"/><polygon points="${star(172, 100, 12, 6)}" fill="${p.accent}"/>` },
  { id: "tag", name: "Gift tag", group: "Paper", tags: ["tag", "label", "gift"], dieCut: true, box: { x: 10, y: 40, w: 180, h: 120 },
    draw: (p) => `<path d="M50 46 H186 V154 H50 L14 100Z" fill="${p.main}" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round"/><circle cx="46" cy="100" r="9" fill="${WHITE}" stroke="${p.accent}" stroke-width="3"/><path d="M38 100 C10 70 -6 90 6 104" stroke="${p.dark}" stroke-width="3" fill="none"/>` },
  { id: "note", name: "Note paper", group: "Paper", tags: ["note", "paper", "planner"], box: { x: 20, y: 10, w: 160, h: 180 },
    draw: (p) => `<rect x="24" y="14" width="152" height="172" rx="4" fill="${p.light}" stroke="#e6ddd2" stroke-width="2"/>${[50, 74, 98, 122, 146, 170].map((y) => `<line x1="34" y1="${y}" x2="166" y2="${y}" stroke="${p.main}" stroke-width="2"/>`).join("")}<line x1="52" y1="14" x2="52" y2="186" stroke="${p.accent}" stroke-width="2"/><rect x="70" y="2" width="60" height="22" fill="${p.pop}" opacity=".75" transform="rotate(4 100 13)"/>` },
  { id: "sticky-note", name: "Sticky note", group: "Paper", tags: ["sticky note", "memo", "planner"], box: { x: 20, y: 20, w: 160, h: 160 },
    draw: (p) => `<path d="M26 26 H174 V140 L140 174 H26Z" fill="${p.main}"/><path d="M174 140 L140 140 L140 174Z" fill="${p.accent}"/>` },
  { id: "paperclip", name: "Paper clip", group: "Paper", tags: ["paperclip", "planner", "office"], box: { x: 60, y: 10, w: 80, h: 180 },
    draw: (p) => `<path d="M118 60 V150 a18 18 0 0 1 -36 0 V44 a12 12 0 0 1 24 0 V140 a6 6 0 0 1 -12 0 V64" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/>` },
  { id: "pushpin", name: "Push pin", group: "Paper", tags: ["pin", "board", "planner"], dieCut: true, box: { x: 40, y: 10, w: 120, h: 180 },
    draw: (p) => `<path d="M100 120 L100 190" stroke="#9aa3ad" stroke-width="6" stroke-linecap="round"/><ellipse cx="100" cy="118" rx="40" ry="10" fill="${p.accent}"/><path d="M76 116 L84 60 H116 L124 116Z" fill="${p.accent}"/><ellipse cx="100" cy="56" rx="34" ry="22" fill="${p.main}"/>${shine(88, 50, 8, 5)}` },
  { id: "speech", name: "Speech bubble", group: "Paper", tags: ["speech", "bubble", "chat"], dieCut: true, box: { x: 10, y: 20, w: 180, h: 160 },
    draw: (p) => `<path d="M30 30 H170 Q186 30 186 46 V120 Q186 136 170 136 H90 L56 172 L62 136 H30 Q14 136 14 120 V46 Q14 30 30 30Z" fill="${p.main}"/><path d="${HEART}" fill="${p.accent}" transform="translate(100 84) scale(.3) translate(-100 -96)"/>` },
  { id: "arrow", name: "Doodle arrow", group: "Paper", tags: ["arrow", "doodle", "planner"], box: { x: 0, y: 40, w: 200, h: 120 },
    draw: (p) => `<path d="M10 140 C60 60 110 150 150 80" stroke="${p.accent}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M128 76 L154 74 L156 102" stroke="${p.accent}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },
  { id: "swash", name: "Underline swash", group: "Paper", tags: ["underline", "swash", "doodle"], box: { x: 0, y: 70, w: 200, h: 60 },
    draw: (p) => `<path d="M8 110 C60 80 130 80 192 96 C140 92 70 98 24 120" stroke="${p.accent}" stroke-width="7" fill="none" stroke-linecap="round"/>` },
  { id: "frame-scallop", name: "Scalloped frame", group: "Paper", tags: ["frame", "label", "scallop"], box: { x: 10, y: 10, w: 180, h: 180 },
    draw: (p) => `<circle cx="100" cy="100" r="78" fill="${p.light}"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${100 + 80 * Math.cos((i * Math.PI) / 12)}" cy="${100 + 80 * Math.sin((i * Math.PI) / 12)}" r="12" fill="${p.light}"/>`).join("")}<circle cx="100" cy="100" r="66" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="4 6"/>` },
  { id: "label", name: "Label", group: "Paper", tags: ["label", "tag", "planner"], dieCut: true, box: { x: 0, y: 60, w: 200, h: 80 },
    draw: (p) => `<path d="M20 66 H180 Q194 100 180 134 H20 Q6 100 20 66Z" fill="${p.main}"/><path d="M28 74 H172 Q184 100 172 126 H28 Q16 100 28 74Z" fill="none" stroke="${WHITE}" stroke-width="3" stroke-dasharray="6 5"/>` },
];

/** Washi tape strips — pattern × palette. */
export const WASHI_PATTERNS = ["dots", "stripes", "gingham", "hearts", "stars", "floral"] as const;

export function washi(p: Palette, pattern: (typeof WASHI_PATTERNS)[number]) {
  const body = (() => {
    switch (pattern) {
      case "dots":
        return Array.from({ length: 12 }, (_, i) => `<circle cx="${18 + i * 22}" cy="${i % 2 ? 22 : 42}" r="5" fill="${p.accent}"/>`).join("");
      case "stripes":
        return Array.from({ length: 16 }, (_, i) => `<rect x="${i * 18}" y="-10" width="8" height="90" fill="${p.accent}" opacity=".6" transform="rotate(25 ${i * 18} 32)"/>`).join("");
      case "gingham":
        return `${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 20}" y="0" width="10" height="64" fill="${p.accent}" opacity=".35"/>`).join("")}${[0, 20, 40].map((y) => `<rect x="0" y="${y}" width="270" height="10" fill="${p.accent}" opacity=".35"/>`).join("")}`;
      case "hearts":
        return Array.from({ length: 9 }, (_, i) => `<path d="${HEART}" fill="${p.accent}" transform="translate(${20 + i * 30} ${i % 2 ? 22 : 40}) scale(.09) translate(-100 -96)"/>`).join("");
      case "stars":
        return Array.from({ length: 10 }, (_, i) => `<polygon points="${star(16 + i * 27, i % 2 ? 22 : 40, 9, 4)}" fill="${p.accent}"/>`).join("");
      case "floral":
        return Array.from({ length: 8 }, (_, i) => `${petals(18 + i * 34, i % 2 ? 22 : 40, 5, 4, 6, 6, p.accent)}<circle cx="${18 + i * 34}" cy="${i % 2 ? 22 : 40}" r="3" fill="${p.pop}"/>`).join("");
    }
  })();
  return {
    body: `<defs><clipPath id="w"><path d="M2 4 l6 4 -6 4 6 4 -6 4 6 4 -6 4 6 4 -6 4 6 4 -6 4 6 4 -6 4 6 4 H264 l-6 -4 6 -4 -6 -4 6 -4 -6 -4 6 -4 -6 -4 6 -4 -6 -4 6 -4 -6 -4 6 -4 -6 -4Z"/></clipPath></defs><g clip-path="url(#w)" opacity=".92"><rect x="0" y="0" width="270" height="64" fill="${p.main}"/>${body}</g>`,
    box: { x: 0, y: 0, w: 270, h: 64 },
  };
}
