import * as THREE from "three";
import type { StudioKind } from "@/lib/studio/doc";

/**
 * Procedural, dependency-free 3D product models for the Design Studio
 * preview. Every model exposes `printMaterials` — the faces that carry the
 * customer's design — so the viewer can hot-swap the texture as they edit.
 *
 * Units are roughly metres-scaled-up; ground is y = 0, everything faces +z.
 */

import type { ShelfSpec, StandingItem3D } from "@/components/studio/three/scene";
export type { ShelfSpec };

export interface ProductModel {
  group: THREE.Group;
  printMaterials: THREE.MeshPhysicalMaterial[];
  /** Where the camera looks, and where it starts. */
  target: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  /** Rough radius, used to size shadows and zoom limits. */
  radius: number;
  /** Miniature only: the board that standing cut-outs are attached to. */
  stage?: MiniatureStage;
}

export interface MiniatureStage {
  board: THREE.Object3D;
  W: number;
  H: number;
  D: number;
  shelves: ShelfSpec[];
}

/** 3D thickness and depth of a shelf — shared by the shelf mesh and the items standing on it. */
export function shelfGeometry(s: ShelfSpec, W: number, H: number) {
  return {
    thickness: Math.max(s.height * H, 0.022),
    depth: Math.min(0.16, 0.09 + s.width * W * 0.03),
  };
}

/**
 * Where a shelf from the 2D design sits on a board whose origin is its centre:
 * design y = 0 is the top edge (+H/2), y = 1 the bottom edge (−H/2).
 */
export function shelfCenter(s: Pick<ShelfSpec, "x" | "y" | "width" | "height">, W: number, H: number) {
  return { x: -W / 2 + (s.x + s.width / 2) * W, y: H / 2 - (s.y + s.height / 2) * H };
}

// ─── Materials ─────────────────────────────────────────────────────────────

let woodTextureCache: THREE.CanvasTexture | null = null;

/** Procedural wood grain — a few hundred wavy strokes on a 2D canvas. */
function woodTexture() {
  if (woodTextureCache) return woodTextureCache;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, "#c89a63");
  g.addColorStop(0.5, "#d4a871");
  g.addColorStop(1, "#c18f57");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const x = rand() * 512;
    ctx.strokeStyle = `rgba(${90 + rand() * 40},${55 + rand() * 25},${25 + rand() * 15},${0.05 + rand() * 0.16})`;
    ctx.lineWidth = 0.5 + rand() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 32) ctx.lineTo(x + Math.sin(y * 0.012 + i) * (2 + rand() * 6), y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  woodTextureCache = tex;
  return tex;
}

function woodMaterial(tint = "#ffffff") {
  return new THREE.MeshStandardMaterial({ map: woodTexture(), color: tint, roughness: 0.62, metalness: 0 });
}

function printMaterial(gloss: "matte" | "satin" | "glossy") {
  const roughness = gloss === "glossy" ? 0.22 : gloss === "satin" ? 0.45 : 0.78;
  return new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness,
    metalness: 0,
    clearcoat: gloss === "glossy" ? 1 : gloss === "satin" ? 0.25 : 0,
    clearcoatRoughness: 0.12,
  });
}

const plain = (color: string, roughness = 0.85) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[]) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** A square beam spanning two world points (easel legs, frame struts). */
function beamBetween(a: THREE.Vector3, b: THREE.Vector3, thickness: number, material: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const m = mesh(new THREE.BoxGeometry(thickness, dir.length(), thickness * 0.8), material);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

/** Box with the design on its front face (+z) and plain material elsewhere. */
function printedBoard(w: number, h: number, d: number, print: THREE.Material, edge: THREE.Material, back: THREE.Material) {
  // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
  return mesh(new THREE.BoxGeometry(w, h, d), [edge, edge, edge, edge, print, back]);
}

// ─── Models ────────────────────────────────────────────────────────────────

function miniature(aspect: number, shelves: ShelfSpec[]): ProductModel {
  const group = new THREE.Group();
  const H = 1.4;
  const W = H * aspect;
  const D = 0.07;
  const tilt = 0.16;
  const ledgeY = 0.32;

  const print = printMaterial("matte");
  const foam = plain("#fbfaf7", 0.92);
  const back = plain("#ece4d6", 0.95);
  const wood = woodMaterial();

  // Board + easel share a tilted frame pivoting at the easel ledge.
  const pivot = new THREE.Group();
  pivot.position.set(0, ledgeY, 0);
  pivot.rotation.x = -tilt;
  group.add(pivot);

  const board = printedBoard(W, H, D, print, foam, back);
  board.position.set(0, H / 2, 0);
  pivot.add(board);

  // Real shelves: thin boards sticking out of the front, casting shadows.
  for (const s of shelves) {
    const sw = s.width * W;
    const { thickness: th, depth } = shelfGeometry(s, W, H);
    const shelf = mesh(new THREE.BoxGeometry(sw, th, depth), plain(s.color || "#ffffff", 0.7));
    const at = shelfCenter(s, W, H);
    shelf.position.set(at.x, at.y, D / 2 + depth / 2);
    board.add(shelf);
  }

  // Easel (in the tilted frame): two legs behind the board, a front ledge.
  const easelW = Math.min(W * 0.62, 0.7);
  const legLen = ledgeY / Math.cos(tilt) + H * 0.55;
  for (const side of [-1, 1]) {
    const leg = mesh(new THREE.BoxGeometry(0.045, legLen, 0.035), wood);
    leg.position.set((side * easelW) / 2, -ledgeY / Math.cos(tilt) + legLen / 2, -D / 2 - 0.022);
    leg.rotation.z = side * 0.05;
    pivot.add(leg);
  }
  const ledge = mesh(new THREE.BoxGeometry(easelW + 0.16, 0.035, D + 0.09), wood);
  ledge.position.set(0, -0.018, 0.02);
  pivot.add(ledge);
  const lip = mesh(new THREE.BoxGeometry(easelW + 0.16, 0.05, 0.014), wood);
  lip.position.set(0, 0.008, D / 2 + 0.06);
  pivot.add(lip);
  const crossbar = mesh(new THREE.BoxGeometry(easelW, 0.03, 0.025), wood);
  crossbar.position.set(0, H * 0.42, -D / 2 - 0.03);
  pivot.add(crossbar);

  // Back leg from the top of the easel down to the floor behind it.
  group.updateMatrixWorld(true);
  const top = pivot.localToWorld(new THREE.Vector3(0, H * 0.5, -D / 2 - 0.045));
  const foot = new THREE.Vector3(0, 0, top.z - 0.55);
  group.add(beamBetween(top, foot, 0.04, wood));

  return {
    group,
    printMaterials: [print],
    target: new THREE.Vector3(0, ledgeY + H * 0.5, 0),
    cameraPosition: new THREE.Vector3(0.9, ledgeY + H * 0.62, 2.9),
    radius: Math.max(W, H) * 0.9,
    stage: { board, W, H, D, shelves },
  };
}

const ITEM_THICKNESS = 0.014;

/**
 * Stands each cut-out on its shelf: bottom edge on the 3D shelf's top
 * surface, centred in the shelf's depth, casting a shadow shaped like the
 * item itself (alpha-tested depth material). Solid items (photo frames,
 * plates) get a slim body; stickers are thin cut-out standees.
 */
export function buildStandingItems(stage: MiniatureStage, items: StandingItem3D[], anisotropy: number) {
  const group = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const depthMaterials: THREE.Material[] = [];
  const loader = new THREE.TextureLoader();
  const { W, H, D, shelves } = stage;

  for (const item of items) {
    const shelf = shelves[item.shelfIndex];
    if (!shelf) continue;
    const { thickness, depth } = shelfGeometry(shelf, W, H);
    // The 3D shelf may be a little thicker than the drawn one; lift items by
    // the same amount so they sit exactly on its top surface.
    const shelfTop3D = shelfCenter(shelf, W, H).y + thickness / 2;
    const lift = shelfTop3D - (H / 2 - shelf.y * H);

    const w = item.width * W;
    const h = item.height * H;
    const bottom = H / 2 - item.supportTop * H + lift;
    const cx = -W / 2 + (item.x + item.width / 2) * W;
    const z = D / 2 + depth * (item.level === 0 ? 0.45 : 0.42);

    const tex = loader.load(item.url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    textures.push(tex);

    const face = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, roughness: 0.55 });
    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.35 });

    let obj: THREE.Mesh;
    if (item.solid) {
      const edge = plain(item.edge || "#ffffff", 0.6);
      obj = mesh(new THREE.BoxGeometry(w, h, ITEM_THICKNESS), [edge, edge, edge, edge, face, edge]);
      obj.position.set(cx, bottom + h / 2, z + ITEM_THICKNESS / 2);
    } else {
      face.side = THREE.DoubleSide;
      obj = mesh(new THREE.PlaneGeometry(w, h), face);
      obj.customDepthMaterial = depthMat;
      depthMaterials.push(depthMat);
      obj.position.set(cx, bottom + h / 2, z);
    }
    if (item.solid) depthMat.dispose();
    group.add(obj);
  }

  stage.board.add(group);
  return {
    group,
    dispose() {
      stage.board.remove(group);
      disposeObject(group);
      for (const t of textures) t.dispose();
      for (const m of depthMaterials) m.dispose();
    },
  };
}

function mug(aspect: number): ProductModel {
  const group = new THREE.Group();
  const R = 0.42;
  const gap = Math.PI * 2 * 0.16; // unprinted strip where the handle joins
  const thetaLength = Math.PI * 2 - gap;
  const printH = Math.min(1.25, (R * thetaLength) / Math.max(aspect, 0.5));
  const bodyH = printH + 0.16;
  const wall = 0.028;

  const ceramic = new THREE.MeshPhysicalMaterial({
    color: "#fdfdfb",
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const inner = new THREE.MeshPhysicalMaterial({ color: "#f3f1ec", roughness: 0.25, clearcoat: 0.6, side: THREE.BackSide });
  const print = printMaterial("glossy");

  const body = mesh(new THREE.CylinderGeometry(R, R * 0.97, bodyH, 128, 1, true), ceramic);
  body.position.y = bodyH / 2;
  group.add(body);

  // Printed wrap sits a hair above the body; the gap is centred on the handle (+x).
  const wrap = mesh(
    new THREE.CylinderGeometry(R + 0.0015, R * 0.97 + 0.0015, printH, 160, 1, true, Math.PI / 2 + gap / 2, thetaLength),
    print,
  );
  wrap.position.y = bodyH / 2;
  group.add(wrap);

  const innerWall = mesh(new THREE.CylinderGeometry(R - wall, R * 0.97 - wall, bodyH - 0.05, 96, 1, true), inner);
  innerWall.position.y = bodyH / 2 + 0.025;
  group.add(innerWall);

  const rim = mesh(new THREE.RingGeometry(R - wall, R, 128), ceramic);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = bodyH;
  group.add(rim);

  const floor = mesh(new THREE.CircleGeometry(R - wall, 96), plain("#efede8", 0.3));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.06;
  group.add(floor);

  const base = mesh(new THREE.CircleGeometry(R * 0.97, 96), ceramic);
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.001;
  group.add(base);

  // C-shaped handle on +x.
  const handle = mesh(new THREE.TorusGeometry(bodyH * 0.27, 0.048, 32, 96, Math.PI), ceramic);
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(R - 0.015, bodyH * 0.52, 0);
  group.add(handle);

  // Face the centre of the print towards the camera, handle to the back-right.
  group.rotation.y = Math.PI / 2;

  return {
    group,
    printMaterials: [print],
    target: new THREE.Vector3(0, bodyH / 2, 0),
    cameraPosition: new THREE.Vector3(1.15, bodyH * 0.95, 2.5),
    radius: Math.max(R * 2.4, bodyH),
  };
}

function frame(aspect: number): ProductModel {
  const group = new THREE.Group();
  const H = 1.2;
  const W = H * aspect;
  const m = 0.1; // moulding width
  const md = 0.075; // moulding depth
  const tilt = 0.13;

  const print = printMaterial("satin");
  const moulding = woodMaterial("#6b4a33");
  const mdf = plain("#8b6b4a", 0.95);

  const pivot = new THREE.Group();
  pivot.rotation.x = -tilt;
  group.add(pivot);

  const inner = new THREE.Group();
  inner.position.set(0, H / 2 + m, 0);
  pivot.add(inner);

  const picture = printedBoard(W, H, 0.006, print, plain("#ffffff"), mdf);
  inner.add(picture);
  const backing = mesh(new THREE.BoxGeometry(W + m, H + m, 0.02), mdf);
  backing.position.z = -0.014;
  inner.add(backing);

  const bars: [number, number, number, number][] = [
    [0, H / 2 + m / 2, W + m * 2, m],
    [0, -H / 2 - m / 2, W + m * 2, m],
    [-W / 2 - m / 2, 0, m, H],
    [W / 2 + m / 2, 0, m, H],
  ];
  for (const [x, y, w, h] of bars) {
    const bar = mesh(new THREE.BoxGeometry(w, h, md), moulding);
    bar.position.set(x, y, md / 2 - 0.012);
    inner.add(bar);
  }

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.1,
      roughness: 0.03,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    }),
  );
  glass.position.z = 0.012;
  inner.add(glass);

  // Fold-out strut on the back.
  group.updateMatrixWorld(true);
  const top = inner.localToWorld(new THREE.Vector3(0, H * 0.15, -0.03));
  const foot = new THREE.Vector3(0, 0, top.z - H * 0.42);
  group.add(beamBetween(top, foot, 0.07, mdf));

  return {
    group,
    printMaterials: [print],
    target: new THREE.Vector3(0, H / 2 + m, 0),
    cameraPosition: new THREE.Vector3(0.8, H * 0.7, 2.6),
    radius: Math.max(W, H) * 0.95,
  };
}

function card(aspect: number, thick: boolean): ProductModel {
  const group = new THREE.Group();
  const H = thick ? 1.25 : 1.05;
  const W = H * aspect;
  const D = thick ? 0.045 : 0.012;
  const tilt = 0.08;
  const baseH = 0.07;

  const print = printMaterial(thick ? "matte" : "satin");
  const paper = plain("#fbf9f4", 0.9);
  const wood = woodMaterial();

  const pivot = new THREE.Group();
  pivot.position.set(0, baseH * 0.55, 0);
  pivot.rotation.x = -tilt;
  group.add(pivot);
  const board = printedBoard(W, H, D, print, paper, paper);
  board.position.y = H / 2;
  pivot.add(board);

  const base = mesh(new THREE.BoxGeometry(Math.max(0.4, W * 0.62), baseH, 0.2), wood);
  base.position.y = baseH / 2;
  group.add(base);

  return {
    group,
    printMaterials: [print],
    target: new THREE.Vector3(0, H / 2 + baseH, 0),
    cameraPosition: new THREE.Vector3(0.7, H * 0.65, 2.4),
    radius: Math.max(W, H) * 0.85,
  };
}

export function buildModel(kind: StudioKind, aspect: number, shelves: ShelfSpec[]): ProductModel {
  switch (kind) {
    case "MUG":
      return mug(aspect);
    case "MINIATURE":
      return miniature(aspect, shelves);
    case "FRAME":
      return frame(aspect);
    case "CARD":
      return card(aspect, false);
    default:
      return card(aspect, true);
  }
}

/** Frees GPU memory held by a model (geometries + materials, not shared textures). */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) mat.dispose();
  });
}
