"use client";

import { useEffect, useRef, useState } from "react";
import { analyzeShelfScene, docImageUrls, type DesignDoc, type StudioKind } from "@/lib/studio/doc";
import type { Scene3D } from "@/components/studio/three/scene";
import { CanvasStage, type CanvasHandle } from "@/components/studio/editor/CanvasStage";
import { loadImage } from "@/components/studio/editor/images";
import { loadStudioFonts, STUDIO_FONTS } from "@/components/studio/fonts";
import { cn } from "@/lib/utils";

/**
 * Read-only render of a design document, fitted to its box. Used for template
 * cards that don't have an uploaded thumbnail yet. Optionally hands back a
 * snapshot image (for the 3D preview) once fonts and images have loaded.
 */
export function StaticDesignPreview({
  doc,
  kind = "STANDARD",
  className,
  onSnapshot,
}: {
  doc: DesignDoc;
  kind?: StudioKind;
  className?: string;
  /** Receives a 3D scene (wall print + standing cut-outs for miniatures). */
  onSnapshot?: (scene: Scene3D) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [canvas, setCanvas] = useState<CanvasHandle | null>(null);
  const snapshotFor = useRef<DesignDoc | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!canvas || !onSnapshot || snapshotFor.current === doc) return;
    let alive = true;
    (async () => {
      await loadStudioFonts();
      await Promise.all(docImageUrls(doc).map((src) => loadImage(src).catch(() => null)));
      await new Promise((r) => setTimeout(r, 120));
      if (!alive) return;
      const scene =
        kind === "MINIATURE"
          ? canvas.sceneSnapshot(1400, analyzeShelfScene(doc))
          : { texture: canvas.quickPreview(1400), shelves: [], items: [] };
      if (scene?.texture) {
        snapshotFor.current = doc;
        onSnapshot(scene);
      }
    })();
    return () => {
      alive = false;
    };
  }, [canvas, doc, kind, onSnapshot]);

  const scale = box.w && box.h ? Math.min(box.w / doc.width, box.h / doc.height) : 0;
  const fontClasses = Object.values(STUDIO_FONTS)
    .map((f) => f.className)
    .join(" ");

  return (
    <div ref={boxRef} className={cn("flex items-center justify-center", fontClasses, className)}>
      {scale > 0 ? (
        <div className="pointer-events-none shadow-[0_10px_24px_-14px_rgba(30,42,74,0.5)]">
          <CanvasStage
            ref={setCanvas}
            doc={doc}
            scale={scale}
            mode="customer"
            readOnly
            selectedId={null}
            onSelect={() => undefined}
            onUpdateNode={() => undefined}
            onDrop={() => undefined}
            onPhotoRequest={() => undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
