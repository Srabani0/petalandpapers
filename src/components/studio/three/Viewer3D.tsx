"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RotateCw, Pause, Undo2, FlipHorizontal2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioKind } from "@/lib/studio/doc";
import {
  buildModel,
  buildStandingItems,
  disposeObject,
  type MiniatureStage,
  type ShelfSpec,
} from "@/components/studio/three/models";
import type { StandingItem3D } from "@/components/studio/three/scene";

interface Props {
  kind: StudioKind;
  /** Design image to put on the product (data: URL or a CORS-enabled URL). */
  textureUrl: string | null;
  /** Design width ÷ height. */
  aspect: number;
  shelves?: ShelfSpec[];
  /** Cut-outs that stand on the shelves (3D miniatures). */
  items?: StandingItem3D[];
  className?: string;
  /** Compact = no on-screen controls (side-panel thumbnail). */
  compact?: boolean;
  autoRotate?: boolean;
}

type Ctx = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  printMaterials: THREE.MeshPhysicalMaterial[];
  home: THREE.Vector3;
  target: THREE.Vector3;
  flyTo: THREE.Vector3 | null;
  stage?: MiniatureStage;
  standing?: { dispose(): void };
};

/**
 * Realistic, rotatable 3D preview of the design on the actual product:
 * physically-based materials, studio reflections, soft contact shadow.
 * Drag to orbit all the way round (see the back), scroll/pinch to zoom.
 */
const NO_ITEMS: StandingItem3D[] = [];

export function Viewer3D({
  kind,
  textureUrl,
  aspect,
  shelves = [],
  items = NO_ITEMS,
  className,
  compact = false,
  autoRotate = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<Ctx | null>(null);
  const [failed, setFailed] = useState(false);
  const [spinning, setSpinning] = useState(autoRotate);
  const shelvesKey = JSON.stringify(shelves);

  // ── Scene (rebuilt when the product shape changes) ─────────────────────
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
    } catch {
      // No WebGL (old device / disabled GPU): report it outside the effect body.
      queueMicrotask(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.75;

    const parsedShelves = JSON.parse(shelvesKey) as ShelfSpec[];
    const model = buildModel(kind, aspect, parsedShelves);
    scene.add(model.group);

    // Soft key light with shadows + gentle fill.
    const key = new THREE.DirectionalLight("#fff6ea", 2.2);
    key.position.set(-2.2, 4.2, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    const r = model.radius * 2.2;
    Object.assign(key.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 0.5, far: 14 });
    key.target.position.copy(model.target);
    scene.add(key, key.target);
    scene.add(new THREE.HemisphereLight("#ffffff", "#d8ccb8", 0.55));

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(model.radius * 4, 64),
      new THREE.ShadowMaterial({ opacity: 0.2 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    camera.position.copy(model.cameraPosition);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(model.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = model.radius * 1.3;
    controls.maxDistance = model.radius * 6;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // never look from under the floor
    controls.autoRotateSpeed = 1.6;
    controls.update();

    const ctx: Ctx = {
      renderer,
      camera,
      controls,
      printMaterials: model.printMaterials,
      home: model.cameraPosition.clone(),
      target: model.target.clone(),
      flyTo: null,
      stage: model.stage,
    };
    ctxRef.current = ctx;

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const stopFly = () => (ctx.flyTo = null);
    controls.addEventListener("start", stopFly);

    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (ctx.flyTo) {
        camera.position.lerp(ctx.flyTo, 0.12);
        if (camera.position.distanceTo(ctx.flyTo) < 0.01) ctx.flyTo = null;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.removeEventListener("start", stopFly);
      controls.dispose();
      for (const mat of ctx.printMaterials) mat.map?.dispose();
      disposeObject(scene);
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      ctxRef.current = null;
    };
  }, [kind, aspect, shelvesKey]);

  // ── Design texture (hot-swapped as the customer edits) ─────────────────
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !textureUrl) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      textureUrl,
      (tex) => {
        const current = ctxRef.current;
        if (cancelled || !current) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = current.renderer.capabilities.getMaxAnisotropy();
        for (const mat of current.printMaterials) {
          const old = mat.map;
          mat.map = tex;
          mat.needsUpdate = true;
          if (old && old !== tex) old.dispose();
        }
      },
      undefined,
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [textureUrl, kind, aspect, shelvesKey]);

  // ── Items standing on the shelves (rebuilt whenever the design changes) ─
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx?.stage || items.length === 0) return;
    const built = buildStandingItems(ctx.stage, items, ctx.renderer.capabilities.getMaxAnisotropy());
    ctx.standing = built;
    return () => {
      built.dispose();
      if (ctx.standing === built) ctx.standing = undefined;
    };
  }, [items, kind, aspect, shelvesKey]);

  useEffect(() => {
    if (ctxRef.current) ctxRef.current.controls.autoRotate = spinning;
  }, [spinning, kind, aspect, shelvesKey]);

  function view(side: "front" | "back") {
    const ctx = ctxRef.current;
    if (!ctx) return;
    setSpinning(false);
    const offset = ctx.home.clone().sub(ctx.target);
    if (side === "back") offset.set(-offset.x, offset.y, -offset.z);
    ctx.flyTo = ctx.target.clone().add(offset);
  }

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center rounded-xl bg-cream-dark p-6 text-center text-sm text-muted", className)}>
        3D preview isn&apos;t supported on this device.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_35%,#ffffff_0%,#f4efe6_55%,#e6ddcd_100%)]",
        className,
      )}
    >
      <div ref={hostRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {!textureUrl ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted">Rendering…</div>
      ) : null}
      {compact ? null : (
        <div className="absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-2 px-3">
          <ViewButton onClick={() => view("front")} icon={<Undo2 className="h-4 w-4" />} label="Front" />
          <ViewButton onClick={() => view("back")} icon={<FlipHorizontal2 className="h-4 w-4" />} label="Back" />
          <ViewButton
            onClick={() => setSpinning((s) => !s)}
            icon={spinning ? <Pause className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
            label={spinning ? "Stop" : "Rotate"}
            active={spinning}
          />
        </div>
      )}
      {compact ? null : (
        <p className="pointer-events-none absolute top-3 left-0 w-full text-center text-xs text-muted">
          Drag to turn it around · scroll or pinch to zoom
        </p>
      )}
    </div>
  );
}

function ViewButton({
  onClick,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition",
        active ? "border-navy bg-navy text-cream" : "border-border bg-white/85 text-navy hover:border-gold",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
