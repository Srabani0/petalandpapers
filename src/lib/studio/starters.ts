import {
  emptyDoc,
  makePhoto,
  makeShape,
  makeText,
  type DesignDoc,
  type DesignNode,
} from "@/lib/studio/doc";

/**
 * Built-in starting layouts for the admin template editor, so a new template
 * doesn't begin from a blank canvas. Everything is expressed as fractions of
 * the canvas, so a starter works at any size. Skeleton parts (background,
 * shelves) come locked; photo frames / text / name plates stay editable.
 */

export const STARTERS = [
  { key: "blank", label: "Blank canvas" },
  { key: "shelves3", label: "3D miniature · 3 shelves" },
  { key: "shelves2", label: "3D miniature · 2 shelves" },
  { key: "collage", label: "Photo frame · collage" },
  { key: "mug", label: "Mug wrap · photo + text" },
] as const;
export type StarterKey = (typeof STARTERS)[number]["key"];

export function buildStarter(key: StarterKey, width: number, height: number): DesignDoc {
  const doc = emptyDoc(width, height);
  const W = (f: number) => Math.round(width * f);
  const H = (f: number) => Math.round(height * f);
  const nodes: DesignNode[] = [];

  if (key === "shelves3" || key === "shelves2") {
    doc.background = { color: "#e8e9f3", imageUrl: null, locked: true };
    const shelfCount = key === "shelves3" ? 3 : 2;
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
        }),
      );

      // One framed photo per shelf, alternating sides, resting on the shelf.
      const frameH = H(gap * 0.72);
      const frameW = Math.round(frameH * 0.82);
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

    // Name plate on the bottom shelf.
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
        text: "Best Teacher Ever",
        fontFamily: "dancing",
        bold: true,
        fontSize: H(0.045),
        fill: "#c0392b",
        x: W(0.45),
        y: H(0.12),
        width: W(0.45),
        height: H(0.07),
        rotation: -8,
      }),
    );
  }

  if (key === "collage") {
    doc.background = { color: "#faf6ee", imageUrl: null, locked: true };
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
        x: W(0.04),
        y: H(0.38),
        width: W(0.26),
        height: H(0.26),
      }),
      makeText(doc, {
        name: "Right text",
        text: "Love you always",
        fontFamily: "caveat",
        fontSize: H(0.1),
        fill: "#1e2a4a",
        x: W(0.7),
        y: H(0.4),
        width: W(0.26),
        height: H(0.2),
      }),
    );
  }

  doc.nodes = nodes;
  return doc;
}
