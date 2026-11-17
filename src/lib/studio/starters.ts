import {
  emptyDoc,
  makePhoto,
  makeShape,
  makeText,
  type DesignDoc,
  type DesignNode,
  type StudioKind,
} from "@/lib/studio/doc";
import { FLORAL_STARTERS, buildFloral, type FloralStarter } from "@/lib/studio/floral-starters";

/**
 * Built-in starting layouts ("skeletons"). Everything is expressed as
 * fractions of the canvas so a starter works at any size. Skeleton parts
 * (background, shelves) come locked; photo frames / text / name plates stay
 * editable for customers.
 */

export const STARTERS = [
  { key: "blank", label: "Blank canvas" },
  { key: "shelves3", label: "3D miniature · 3 shelves" },
  { key: "shelves2", label: "3D miniature · 2 shelves" },
  { key: "shelf1", label: "3D miniature · 1 shelf (couple)" },
  { key: "single", label: "Photo frame · single photo + caption" },
  { key: "collage", label: "Photo frame · 4-photo collage" },
  { key: "polaroid", label: "Photo frame · polaroid memories" },
  { key: "floralSunflower", label: "Pipe-cleaner frame · sunflower garden" },
  { key: "floralPastel", label: "Pipe-cleaner frame · pastel daisies" },
  { key: "floralRose", label: "Pipe-cleaner frame · roses & hearts" },
  { key: "floralGarland", label: "Pipe-cleaner frame · spring garland" },
  { key: "mug", label: "Mug · photo + messages" },
  { key: "mugStrip", label: "Mug · photo strip" },
  { key: "mugName", label: "Mug · name & quote" },
  { key: "card", label: "Card · photo card" },
  { key: "cardMessage", label: "Card · message card" },
] as const;
export type StarterKey = (typeof STARTERS)[number]["key"];

export const DEFAULT_STARTER: Record<StudioKind, StarterKey> = {
  MINIATURE: "shelves3",
  MUG: "mug",
  FRAME: "single",
  CARD: "card",
  STANDARD: "blank",
};

export function buildStarter(key: StarterKey, width: number, height: number): DesignDoc {
  const doc = emptyDoc(width, height);
  const W = (f: number) => Math.round(width * f);
  const H = (f: number) => Math.round(height * f);
  const M = (f: number) => Math.round(Math.min(width, height) * f);
  const nodes: DesignNode[] = [];

  // ── 3D miniature shelf scenes ──────────────────────────────────────────
  if (key === "shelves3" || key === "shelves2" || key === "shelf1") {
    const shelfCount = key === "shelves3" ? 3 : key === "shelves2" ? 2 : 1;
    doc.background = { color: key === "shelf1" ? "#f6e7ea" : "#e8e9f3", imageUrl: null, locked: true };
    const shelfH = Math.max(8, H(0.018));
    const gap = 0.9 / shelfCount;

    for (let i = 0; i < shelfCount; i++) {
      const shelfY = H(0.06 + gap * (i + 1)) - shelfH;
      nodes.push(
        makeShape(doc, "rect", {
          name: `Shelf ${i + 1}`,
          x: W(0.03),
          y: shelfY,
          width: W(0.94),
          height: shelfH,
          fill: "#ffffff",
          stroke: "#d7d8e3",
          strokeWidth: 1,
          cornerRadius: 2,
          shadow: true,
          locked: true,
          slideY: true,
        }),
      );

      const frameH = H(gap * (shelfCount === 1 ? 0.6 : 0.72));
      const frameW = Math.round(frameH * 0.82);
      if (shelfCount === 1) {
        // Couple: two photos side by side on one shelf.
        for (const side of [0, 1]) {
          nodes.push(
            makePhoto(doc, {
              name: `Photo ${side + 1}`,
              x: side === 0 ? W(0.14) : W(0.86) - frameW,
              y: shelfY - frameH,
              width: frameW,
              height: frameH,
              shadow: true,
            }),
          );
        }
      } else {
        nodes.push(
          makePhoto(doc, {
            name: `Photo ${i + 1}`,
            x: i % 2 === 0 ? W(0.1) : W(0.9) - frameW,
            y: shelfY - frameH,
            width: frameW,
            height: frameH,
            shadow: true,
          }),
        );
      }
    }

    const plateW = W(0.32);
    const plateH = H(0.05);
    const bottomShelfY = H(0.06 + gap * shelfCount) - shelfH;
    nodes.push(
      makeShape(doc, "rect", {
        name: "Name plate",
        x: Math.round((width - plateW) / 2),
        y: bottomShelfY - plateH,
        width: plateW,
        height: plateH,
        fill: "#b8893e",
        stroke: "#7a5a26",
        strokeWidth: 2,
        cornerRadius: 3,
        shadow: true,
      }),
      makeText(doc, {
        name: "Name",
        text: "Your Name",
        fontFamily: "playfair",
        fontSize: Math.round(plateH * 0.5),
        fill: "#fff8e7",
        x: Math.round((width - plateW) / 2),
        y: bottomShelfY - plateH + Math.round(plateH * 0.22),
        width: plateW,
        height: Math.round(plateH * 0.6),
      }),
      makeText(doc, {
        name: "Heading",
        text: key === "shelves3" ? "Best Teacher Ever" : key === "shelves2" ? "Our Little Family" : "Forever Us",
        fontFamily: "dancing",
        bold: true,
        fontSize: H(shelfCount === 1 ? 0.075 : 0.045),
        fill: key === "shelf1" ? "#c2185b" : "#c0392b",
        x: shelfCount === 1 ? W(0.1) : W(0.45),
        y: shelfCount === 1 ? H(0.1) : H(0.12),
        width: shelfCount === 1 ? W(0.8) : W(0.45),
        height: H(0.08),
        rotation: shelfCount === 1 ? 0 : -8,
      }),
    );
  }

  // ── Photo frames ───────────────────────────────────────────────────────
  if (key === "single") {
    doc.background = { color: "#ffffff", imageUrl: null, locked: false };
    nodes.push(
      makePhoto(doc, {
        name: "Photo",
        x: W(0.07),
        y: W(0.07),
        width: W(0.86),
        height: H(0.78) - W(0.07),
        stroke: "#ffffff",
        strokeWidth: 0,
        padding: 0,
      }),
      makeText(doc, {
        name: "Caption",
        text: "Our favourite day",
        fontFamily: "greatVibes",
        fontSize: H(0.07),
        fill: "#1e2a4a",
        x: W(0.06),
        y: H(0.81),
        width: W(0.88),
        height: H(0.09),
      }),
    );
  }

  if (key === "collage") {
    doc.background = { color: "#faf6ee", imageUrl: null, locked: false };
    const pad = W(0.06);
    const cellW = Math.round((width - pad * 3) / 2);
    const cellH = Math.round((height * 0.78 - pad * 3) / 2);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        nodes.push(
          makePhoto(doc, {
            name: `Photo ${r * 2 + c + 1}`,
            x: pad + c * (cellW + pad),
            y: pad + r * (cellH + pad),
            width: cellW,
            height: cellH,
            stroke: "#ffffff",
            fill: "#ffffff",
            cornerRadius: Math.round(cellW * 0.03),
            shadow: true,
          }),
        );
      }
    }
    nodes.push(
      makeText(doc, {
        name: "Caption",
        text: "Forever & Always",
        fontFamily: "greatVibes",
        fontSize: H(0.07),
        fill: "#1e2a4a",
        x: pad,
        y: H(0.82),
        width: width - pad * 2,
        height: H(0.1),
      }),
    );
  }

  if (key === "polaroid") {
    doc.background = { color: "#e9dfd0", imageUrl: null, locked: false };
    const count = width > height ? 3 : 2;
    const cardW = Math.round((width * 0.84) / count);
    const cardH = Math.round(cardW * 1.2);
    for (let i = 0; i < count; i++) {
      const cx = W(0.08) + i * cardW + cardW / 2;
      nodes.push(
        makePhoto(doc, {
          name: `Polaroid ${i + 1}`,
          x: Math.round(cx - cardW * 0.46),
          y: Math.round(height * 0.2 + (i % 2) * height * 0.06),
          width: Math.round(cardW * 0.92),
          height: Math.round(cardH * 0.92),
          fill: "#ffffff",
          stroke: "#e0e0e0",
          strokeWidth: 1,
          padding: Math.round(cardW * 0.06),
          shadow: true,
          rotation: [-6, 4, -3][i] ?? 0,
        }),
      );
    }
    nodes.push(
      makeText(doc, {
        name: "Title",
        text: "Memories",
        fontFamily: "caveat",
        bold: true,
        fontSize: H(0.1),
        fill: "#5d4037",
        x: W(0.05),
        y: H(0.04),
        width: W(0.9),
        height: H(0.12),
      }),
    );
  }

  // ── Mugs (print area is the flat wrap; the centre faces the viewer) ─────
  if (key === "mug") {
    doc.background = { color: "#ffffff", imageUrl: null, locked: false };
    const frameH = H(0.78);
    const frameW = Math.round(frameH * 0.85);
    nodes.push(
      makePhoto(doc, {
        name: "Main photo",
        x: Math.round((width - frameW) / 2),
        y: Math.round((height - frameH) / 2),
        width: frameW,
        height: frameH,
        cornerRadius: Math.round(frameW * 0.06),
        stroke: "#ffffff",
        strokeWidth: 0,
        padding: 0,
      }),
      makeText(doc, {
        name: "Left text",
        text: "World's Best Mom",
        fontFamily: "pacifico",
        fontSize: H(0.1),
        fill: "#c0392b",
        x: W(0.06),
        y: H(0.36),
        width: W(0.24),
        height: H(0.28),
      }),
      makeText(doc, {
        name: "Right text",
        text: "Love you always",
        fontFamily: "caveat",
        fontSize: H(0.11),
        fill: "#1e2a4a",
        x: W(0.7),
        y: H(0.38),
        width: W(0.24),
        height: H(0.24),
      }),
    );
  }

  if (key === "mugStrip") {
    doc.background = { color: "#1e2a4a", imageUrl: null, locked: false };
    const n = 4;
    const gapX = W(0.02);
    const cellW = Math.round((width * 0.84 - gapX * (n - 1)) / n);
    for (let i = 0; i < n; i++) {
      nodes.push(
        makePhoto(doc, {
          name: `Photo ${i + 1}`,
          x: W(0.08) + i * (cellW + gapX),
          y: H(0.14),
          width: cellW,
          height: H(0.56),
          stroke: "#ffffff",
          strokeWidth: M(0.012),
          fill: "#ffffff",
          padding: 0,
          cornerRadius: M(0.02),
        }),
      );
    }
    nodes.push(
      makeText(doc, {
        name: "Caption",
        text: "Best Friends Forever",
        fontFamily: "pacifico",
        fontSize: H(0.1),
        fill: "#f3d9de",
        x: W(0.08),
        y: H(0.75),
        width: W(0.84),
        height: H(0.14),
      }),
    );
  }

  if (key === "mugName") {
    doc.background = { color: "#fdf6ec", imageUrl: null, locked: false };
    nodes.push(
      makeText(doc, {
        name: "Name",
        text: "Priya",
        fontFamily: "greatVibes",
        fontSize: H(0.3),
        fill: "#a67c3d",
        x: W(0.2),
        y: H(0.16),
        width: W(0.6),
        height: H(0.36),
      }),
      makeText(doc, {
        name: "Quote",
        text: "Good days start with coffee & you",
        fontFamily: "montserrat",
        fontSize: H(0.07),
        letterSpacing: 2,
        fill: "#1e2a4a",
        x: W(0.2),
        y: H(0.6),
        width: W(0.6),
        height: H(0.1),
      }),
      makeShape(doc, "rect", { name: "Line", x: W(0.4), y: H(0.55), width: W(0.2), height: Math.max(3, H(0.006)), fill: "#a67c3d" }),
    );
  }

  // ── Cards (bouquet) ────────────────────────────────────────────────────
  if (key === "card") {
    doc.background = { color: "#fff8f5", imageUrl: null, locked: false };
    nodes.push(
      makePhoto(doc, {
        name: "Photo",
        x: W(0.1),
        y: W(0.1),
        width: W(0.8),
        height: H(0.62),
        cornerRadius: M(0.04),
        stroke: "#f3d9de",
        strokeWidth: M(0.015),
        padding: 0,
      }),
      makeText(doc, {
        name: "Message",
        text: "Happy Anniversary",
        fontFamily: "greatVibes",
        fontSize: H(0.075),
        fill: "#c2185b",
        x: W(0.06),
        y: H(0.74),
        width: W(0.88),
        height: H(0.1),
      }),
      makeText(doc, {
        name: "From",
        text: "with love, Rahul",
        fontFamily: "poppins",
        fontSize: H(0.032),
        fill: "#5d4037",
        x: W(0.06),
        y: H(0.86),
        width: W(0.88),
        height: H(0.05),
      }),
    );
  }

  if (key === "cardMessage") {
    doc.background = { color: "#f3d9de", imageUrl: null, locked: false };
    nodes.push(
      makeShape(doc, "rect", {
        name: "Inner card",
        x: W(0.07),
        y: W(0.07),
        width: W(0.86),
        height: height - W(0.14),
        fill: "#fffdf8",
        stroke: "#c98fa0",
        strokeWidth: M(0.006),
        cornerRadius: M(0.03),
        locked: true,
      }),
      makeText(doc, {
        name: "To",
        text: "Dear Ananya,",
        fontFamily: "dancing",
        bold: true,
        fontSize: H(0.06),
        fill: "#c2185b",
        align: "left",
        x: W(0.15),
        y: H(0.14),
        width: W(0.7),
        height: H(0.08),
      }),
      makeText(doc, {
        name: "Message",
        text: "Every petal in this bouquet carries a little of my love for you. Happy Birthday!",
        fontFamily: "playfair",
        italic: true,
        fontSize: H(0.04),
        lineHeight: 1.5,
        fill: "#1e2a4a",
        align: "left",
        x: W(0.15),
        y: H(0.28),
        width: W(0.7),
        height: H(0.36),
      }),
      makeText(doc, {
        name: "Sign-off",
        text: "— Yours always",
        fontFamily: "caveat",
        fontSize: H(0.055),
        fill: "#5d4037",
        align: "right",
        x: W(0.15),
        y: H(0.76),
        width: W(0.7),
        height: H(0.08),
      }),
    );
  }

  // ── Pipe-cleaner floral frames ─────────────────────────────────────────
  if ((FLORAL_STARTERS as readonly string[]).includes(key)) nodes.push(...buildFloral(key as FloralStarter, doc));

  doc.nodes = nodes;
  return doc;
}
