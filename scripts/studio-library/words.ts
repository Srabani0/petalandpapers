/**
 * Lettering stickers: cute phrases drawn with real Google-font outlines in
 * six Pinterest-style treatments.
 */
import { WHITE, balanceLines, sticker, textPath, type FontKey, type Palette, type StickerSvg } from "./kit";

export const PHRASES: { text: string; group: string; tags: string[] }[] = [
  // Love & friendship
  ...["love you", "so in love", "you & me", "forever", "always", "xoxo", "be mine", "my person", "soulmate", "love you more",
    "together", "us", "my love", "hugs", "kisses", "sweetheart", "cutie", "bestie", "best friends", "bff", "friends forever",
    "partners in crime", "my sunshine", "you're my favourite", "honey", "babe", "lovebirds", "happily ever after"].map((t) => ({ text: t, group: "Love & friends", tags: ["love", "friends"] })),
  // Celebrations
  ...["happy birthday", "birthday girl", "birthday boy", "make a wish", "cheers", "congrats", "congratulations", "party time",
    "let's celebrate", "happy anniversary", "just married", "mr & mrs", "bride to be", "baby shower", "oh baby", "welcome baby",
    "graduation", "class of 2026", "happy new year", "merry christmas", "happy diwali", "happy holi", "eid mubarak", "raksha bandhan",
    "happy valentine's", "happy mother's day", "happy father's day", "happy teachers day"].map((t) => ({ text: t, group: "Celebrations", tags: ["celebrate", "party", "occasion"] })),
  // Family
  ...["mom", "dad", "best mom ever", "best dad ever", "world's best mom", "family", "home sweet home", "sister", "brother",
    "grandma", "grandpa", "little one", "sibling love", "mama", "papa", "daughter", "son"].map((t) => ({ text: t, group: "Family", tags: ["family"] })),
  // Teacher & school
  ...["best teacher", "thank you teacher", "my mentor", "teach love inspire", "a+", "school days", "class favourite",
    "you inspire me", "knowledge is power"].map((t) => ({ text: t, group: "Teacher & school", tags: ["teacher", "school"] })),
  // Good vibes
  ...["good vibes only", "stay cute", "dream big", "be kind", "you got this", "hello", "hey there", "oh happy day",
    "smile", "stay wild", "adventure awaits", "wanderlust", "take me to the beach", "good morning", "goodnight", "sweet dreams",
    "self love", "slay", "main character", "vibes", "chill", "positive vibes", "choose joy", "bloom", "let it be",
    "breathe", "you are enough", "shine bright", "little things", "make memories", "memories", "best day ever",
    "weekend", "yay", "wow", "omg", "lol", "cute", "aww", "thank you", "thanks a latte", "miss you", "get well soon",
    "you're the best", "proud of you", "good luck", "bon voyage", "cheers to us", "made with love", "handmade",
    "just for you", "for you", "special delivery", "open me", "fragile: love inside"].map((t) => ({ text: t, group: "Good vibes", tags: ["quote", "vibes"] })),
];

export const WORD_STYLES = ["script", "pill", "ribbon", "stamp", "bubble", "label"] as const;
export type WordStyle = (typeof WORD_STYLES)[number];

const SCRIPTS: FontKey[] = ["pacifico", "dancing", "greatVibes"];

export function wordSticker(phrase: string, style: WordStyle, p: Palette, variant: number): StickerSvg {
  switch (style) {
    case "script": {
      const f = SCRIPTS[variant % SCRIPTS.length];
      const size = f === "greatVibes" ? 150 : 120;
      const t = textPath(phrase, f, size);
      const w = t.x2 - t.x1;
      const h = t.y2 - t.y1;
      const color = variant % 2 ? p.dark : p.accent;
      const heart = `<path d="M0 12 C-8 6 -12 2 -12 -3 C-12 -8 -6 -10 0 -5 C6 -10 12 -8 12 -3 C12 2 8 6 0 12Z" fill="${p.pop}" transform="translate(${t.x2 + 18} ${t.y1 + 14}) scale(1.4)"/>`;
      return sticker(`<path d="${t.d}" fill="${color}"/>${variant % 3 === 0 ? heart : ""}`, { x: t.x1, y: t.y1, w: w + (variant % 3 === 0 ? 40 : 0), h }, { dieCut: true });
    }
    case "pill": {
      const t = textPath(phrase.toLowerCase(), "fredoka", 70);
      const padX = 44;
      const w = t.width + padX * 2;
      const h = 110;
      const fill = variant % 2 ? p.main : p.accent;
      const ink = variant % 2 ? p.dark : WHITE;
      return sticker(
        `<rect x="0" y="0" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/><path d="${t.d}" fill="${ink}" transform="translate(${padX} ${h / 2 - (t.y1 + t.y2) / 2})"/>`,
        { x: 0, y: 0, w, h },
        { dieCut: true },
      );
    }
    case "ribbon": {
      const t = textPath(phrase.toUpperCase(), "poppins", 54, 4);
      const padX = 50;
      const w = t.width + padX * 2;
      const h = 96;
      const tail = 46;
      const fill = [p.accent, p.dark, p.main][variant % 3];
      const ink = fill === p.main ? p.dark : WHITE;
      const dark = fill === p.dark ? p.accent : p.dark;
      return sticker(
        `<path d="M${-tail} ${h * 0.28} H${tail * 0.4} V${h * 1.12} H${-tail} L${-tail * 0.55} ${h * 0.7}Z" fill="${fill}" opacity=".85"/>
         <path d="M${w + tail} ${h * 0.28} H${w - tail * 0.4} V${h * 1.12} H${w + tail} L${w + tail * 0.55} ${h * 0.7}Z" fill="${fill}" opacity=".85"/>
         <path d="M0 ${h} L${tail * 0.4} ${h * 1.12} V${h}Z M${w} ${h} L${w - tail * 0.4} ${h * 1.12} V${h}Z" fill="${dark}" opacity=".6"/>
         <rect x="0" y="0" width="${w}" height="${h}" fill="${fill}"/>
         <path d="${t.d}" fill="${ink}" transform="translate(${padX} ${h / 2 - (t.y1 + t.y2) / 2})"/>`,
        { x: -tail, y: 0, w: w + tail * 2, h: h * 1.14 },
      );
    }
    case "stamp": {
      const lines = balanceLines(phrase, 11);
      const size = lines.length > 2 ? 44 : lines.length === 2 ? 54 : 64;
      const shapes = lines.map((l) => textPath(l.toUpperCase(), "fredoka", size, 2));
      const textW = Math.max(...shapes.map((s) => s.width));
      const R = Math.max(110, textW / 2 + 46, (lines.length * size * 1.1) / 2 + 50);
      const lineH = size * 1.12;
      const startY = -((lines.length - 1) * lineH) / 2;
      const ink = variant % 2 ? p.dark : p.accent;
      const text = shapes
        .map((s, i) => `<path d="${s.d}" fill="${ink}" transform="translate(${-s.width / 2} ${startY + i * lineH - (s.y1 + s.y2) / 2})"/>`)
        .join("");
      const stars = [0, 1]
        .map((i) => `<circle cx="${(i ? 1 : -1) * (R - 30)}" cy="0" r="7" fill="${ink}"/>`)
        .join("");
      return sticker(
        `<circle r="${R}" fill="${p.light}"/><circle r="${R - 8}" fill="none" stroke="${ink}" stroke-width="6"/><circle r="${R - 20}" fill="none" stroke="${ink}" stroke-width="2.5" stroke-dasharray="3 7"/>${lines.length === 1 ? stars : ""}${text}`,
        { x: -R, y: -R, w: R * 2, h: R * 2 },
        { dieCut: true },
      );
    }
    case "bubble": {
      const lines = balanceLines(phrase, 14);
      const size = 64;
      const shapes = lines.map((l) => textPath(l, "dancing", size));
      const textW = Math.max(...shapes.map((s) => s.width));
      const lineH = size * 1.05;
      const w = textW + 80;
      const h = lines.length * lineH + 60;
      const ink = p.dark;
      const text = shapes
        .map((s, i) => `<path d="${s.d}" fill="${ink}" transform="translate(${(w - s.width) / 2} ${36 + i * lineH + size * 0.72})"/>`)
        .join("");
      const tailX = variant % 2 ? w * 0.25 : w * 0.7;
      return sticker(
        `<path d="M24 0 H${w - 24} Q${w} 0 ${w} 24 V${h - 24} Q${w} ${h} ${w - 24} ${h} H${tailX + 26} L${tailX - 8} ${h + 40} L${tailX} ${h} H24 Q0 ${h} 0 ${h - 24} V24 Q0 0 24 0Z" fill="${WHITE}" stroke="${p.accent}" stroke-width="6" stroke-linejoin="round"/>${text}`,
        { x: 0, y: 0, w, h: h + 44 },
        { dieCut: true },
      );
    }
    case "label": {
      const lines = balanceLines(phrase, 16);
      const size = 58;
      const shapes = lines.map((l) => textPath(l, "playfair", size));
      const textW = Math.max(...shapes.map((s) => s.width));
      const lineH = size * 1.15;
      const w = textW + 90;
      const h = lines.length * lineH + 64;
      const text = shapes
        .map((s, i) => `<path d="${s.d}" fill="${p.dark}" transform="translate(${(w - s.width) / 2} ${40 + i * lineH + size * 0.7})"/>`)
        .join("");
      const tape = `<rect x="${w * 0.08}" y="-16" width="${Math.min(120, w * 0.3)}" height="34" fill="${p.accent}" opacity=".7" transform="rotate(-8 ${w * 0.08} 0)"/>`;
      return sticker(
        `<rect x="0" y="0" width="${w}" height="${h}" fill="${p.light}" stroke="${p.main}" stroke-width="3"/><rect x="10" y="10" width="${w - 20}" height="${h - 20}" fill="none" stroke="${p.main}" stroke-width="2" stroke-dasharray="6 6"/>${text}${tape}`,
        { x: 0, y: -24, w, h: h + 24 },
      );
    }
  }
}
