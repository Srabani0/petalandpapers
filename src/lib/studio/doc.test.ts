import { describe, expect, it } from "vitest";
import {
  MAX_NODES,
  SIZE_PRESETS,
  cloneNode,
  docForCustomer,
  docImageUrls,
  emptyDoc,
  emptyPhotoSlots,
  makeImage,
  makePhoto,
  makeShape,
  makeText,
  parseDesignDoc,
  type DesignDoc,
} from "@/lib/studio/doc";
import { STARTERS, buildStarter } from "@/lib/studio/starters";

const CLOUD = "https://res.cloudinary.com/demo/image/upload/v1/x.png";

function sampleDoc(): DesignDoc {
  const doc = emptyDoc(900, 1200);
  doc.nodes = [
    makeText(doc),
    makePhoto(doc, { src: CLOUD }),
    makePhoto(doc),
    makeShape(doc, "rect"),
    makeShape(doc, "ellipse"),
    makeImage(doc, CLOUD, { width: 400, height: 200 }),
  ];
  return doc;
}

describe("parseDesignDoc — accepts real designs", () => {
  it("round-trips every node type the factories produce", () => {
    const doc = sampleDoc();
    const parsed = parseDesignDoc(JSON.parse(JSON.stringify(doc)));
    expect("doc" in parsed).toBe(true);
  });

  it("accepts every built-in starter at every preset size", () => {
    for (const preset of SIZE_PRESETS) {
      for (const starter of STARTERS) {
        const result = parseDesignDoc(buildStarter(starter.key, preset.width, preset.height));
        expect(result, `${starter.key} @ ${preset.key}`).toHaveProperty("doc");
      }
    }
  });
});

describe("parseDesignDoc — rejects anything unsafe or malformed", () => {
  const withNode = (patch: Record<string, unknown>) => {
    const doc = sampleDoc();
    return { ...doc, nodes: [{ ...doc.nodes[5], ...patch }] };
  };

  it("rejects images that weren't uploaded through us", () => {
    expect(parseDesignDoc(withNode({ src: "https://evil.example/x.png" }))).toHaveProperty("error");
    expect(parseDesignDoc(withNode({ src: "javascript:alert(1)" }))).toHaveProperty("error");
    expect(parseDesignDoc(withNode({ src: "data:image/png;base64,AAAA" }))).toHaveProperty("error");
    expect(parseDesignDoc(withNode({ src: '/x" onerror="alert(1)' }))).toHaveProperty("error");
  });

  it("accepts Cloudinary and site-relative assets", () => {
    expect(parseDesignDoc(withNode({ src: CLOUD }))).toHaveProperty("doc");
    expect(parseDesignDoc(withNode({ src: "/brand/logo-mark.png" }))).toHaveProperty("doc");
  });

  it("rejects bad colours, unknown fonts and unknown node types", () => {
    const doc = sampleDoc();
    expect(parseDesignDoc({ ...doc, background: { ...doc.background, color: "red; x" } })).toHaveProperty("error");
    expect(parseDesignDoc({ ...doc, nodes: [{ ...doc.nodes[0], fontFamily: "Comic Sans" }] })).toHaveProperty("error");
    expect(parseDesignDoc({ ...doc, nodes: [{ ...doc.nodes[0], type: "script" }] })).toHaveProperty("error");
  });

  it("rejects non-finite / absurd geometry", () => {
    expect(parseDesignDoc(withNode({ x: Number.NaN }))).toHaveProperty("error");
    expect(parseDesignDoc(withNode({ width: 0 }))).toHaveProperty("error");
    expect(parseDesignDoc(withNode({ x: 1e9 }))).toHaveProperty("error");
  });

  it("caps node count and text length", () => {
    const doc = sampleDoc();
    const many = Array.from({ length: MAX_NODES + 1 }, () => makeShape(doc, "rect"));
    expect(parseDesignDoc({ ...doc, nodes: many })).toHaveProperty("error");
    expect(parseDesignDoc({ ...doc, nodes: [{ ...doc.nodes[0], text: "x".repeat(501) }] })).toHaveProperty("error");
  });

  it("rejects duplicate node ids", () => {
    const doc = sampleDoc();
    expect(parseDesignDoc({ ...doc, nodes: [doc.nodes[0], doc.nodes[0]] })).toHaveProperty("error");
  });

  it("rejects unknown versions and garbage", () => {
    expect(parseDesignDoc({ ...sampleDoc(), version: 2 })).toHaveProperty("error");
    expect(parseDesignDoc(null)).toHaveProperty("error");
    expect(parseDesignDoc("{}")).toHaveProperty("error");
  });
});

describe("doc helpers", () => {
  it("counts empty photo frames", () => {
    expect(emptyPhotoSlots(sampleDoc())).toBe(1);
  });

  it("lists every referenced image once", () => {
    const doc = sampleDoc();
    doc.background.imageUrl = "/bg.png";
    expect(docImageUrls(doc).sort()).toEqual(["/bg.png", CLOUD].sort());
  });

  it("customer copies start with an empty uploads tray", () => {
    const doc = { ...sampleDoc(), uploads: [CLOUD] };
    expect(docForCustomer(doc).uploads).toEqual([]);
    expect(docForCustomer(doc).nodes).toHaveLength(doc.nodes.length);
  });

  it("clones get a new id, an offset and are unlocked", () => {
    const node = makeShape(emptyDoc(500, 500), "rect", { locked: true });
    const copy = cloneNode(node, 10);
    expect(copy.id).not.toBe(node.id);
    expect(copy.x).toBe(node.x + 10);
    expect(copy.locked).toBe(false);
  });

  it("scales placed images down to fit but never up", () => {
    const doc = emptyDoc(1000, 1000);
    const big = makeImage(doc, CLOUD, { width: 4000, height: 2000 });
    expect(Math.max(big.width, big.height)).toBeLessThanOrEqual(300);
    const small = makeImage(doc, CLOUD, { width: 50, height: 40 });
    expect(small.width).toBe(50);
  });
});

describe("starters", () => {
  it("3-shelf skeleton locks background + shelves and leaves frames editable", () => {
    const doc = buildStarter("shelves3", 900, 1200);
    expect(doc.background.locked).toBe(true);
    const shelves = doc.nodes.filter((n) => n.name?.startsWith("Shelf"));
    expect(shelves).toHaveLength(3);
    expect(shelves.every((s) => s.locked)).toBe(true);
    const frames = doc.nodes.filter((n) => n.type === "photo");
    expect(frames).toHaveLength(3);
    expect(frames.every((f) => !f.locked)).toBe(true);
  });

  it("keeps every node inside the canvas", () => {
    for (const starter of STARTERS) {
      const doc = buildStarter(starter.key, 900, 1200);
      for (const n of doc.nodes) {
        if (n.rotation !== 0) continue;
        expect(n.x, `${starter.key}/${n.name}`).toBeGreaterThanOrEqual(0);
        expect(n.y, `${starter.key}/${n.name}`).toBeGreaterThanOrEqual(0);
        expect(n.x + n.width, `${starter.key}/${n.name}`).toBeLessThanOrEqual(900);
        expect(n.y + n.height, `${starter.key}/${n.name}`).toBeLessThanOrEqual(1200);
      }
    }
  });
});
