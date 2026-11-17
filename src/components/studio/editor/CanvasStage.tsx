"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Group, Rect, Ellipse, Text as KText, Image as KImage, Transformer, Line } from "react-konva";
import Konva from "konva";
import {
  MIN_SIZE,
  detectShelves,
  docImageUrls,
  type StandingGroup,
  type DesignDoc,
  type DesignNode,
  type ImageNode,
  type PhotoNode,
  type ShapeNode,
  type TextNode,
} from "@/lib/studio/doc";
import { STUDIO_FONTS, loadStudioFonts } from "@/components/studio/fonts";
import { loadImage, useLoadedImage } from "@/components/studio/editor/images";
import type { Scene3D, StandingItem3D } from "@/components/studio/three/scene";

export const DRAG_MIME = "application/x-pp-studio";

export type DropPayload =
  | { kind: "image"; src: string }
  | { kind: "photo"; src: string };

export interface CanvasHandle {
  /** Renders the design (without selection UI) to an image, longest side = maxSide px. */
  exportBlob(opts: { maxSide: number; mimeType?: "image/jpeg" | "image/png"; quality?: number }): Promise<Blob>;
  /** Fast, synchronous low-res snapshot of what's on screen now (for live mockups). */
  quickPreview(maxSide: number): string | null;
  /**
   * 3D-miniature snapshot: the wall print *without* the standing groups, plus
   * each standing group cut out on a transparent background.
   */
  sceneSnapshot(maxSide: number, standing: StandingGroup[]): Scene3D | null;
}

interface Props {
  doc: DesignDoc;
  scale: number;
  mode: "admin" | "customer";
  readOnly: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateNode: (id: string, patch: Partial<DesignNode>, key?: string) => void;
  onDrop: (payload: DropPayload, point: { x: number; y: number }) => void;
  onPhotoRequest: (nodeId: string) => void;
}

const SNAP_PX = 8;

function shadowProps(enabled: boolean, size: number) {
  if (!enabled) return {};
  const blur = Math.max(4, size * 0.03);
  return {
    shadowColor: "#000000",
    shadowBlur: blur,
    shadowOffsetX: blur * 0.25,
    shadowOffsetY: blur * 0.45,
    shadowOpacity: 0.28,
  };
}

function fontStyle(node: TextNode) {
  if (node.bold && node.italic) return "italic bold";
  if (node.bold) return "bold";
  if (node.italic) return "italic";
  return "normal";
}

// ─── Node renderers ────────────────────────────────────────────────────────

function ImageContent({ node }: { node: ImageNode }) {
  const { image, failed } = useLoadedImage(node.src);
  if (!image) {
    return (
      <Rect
        width={node.width}
        height={node.height}
        fill={failed ? "#f6dede" : "#eef0f5"}
        stroke="#c9ccd6"
        strokeWidth={1}
        dash={[6, 4]}
      />
    );
  }
  return (
    <KImage
      image={image}
      width={node.width}
      height={node.height}
      scaleX={node.flipX ? -1 : 1}
      offsetX={node.flipX ? node.width : 0}
      {...shadowProps(node.shadow, Math.min(node.width, node.height))}
    />
  );
}

function PhotoContent({ node, editable }: { node: PhotoNode; editable: boolean }) {
  const { image } = useLoadedImage(node.src);
  const pad = Math.min(node.padding, node.width / 2 - 1, node.height / 2 - 1);
  const inner = { x: pad, y: pad, w: Math.max(1, node.width - pad * 2), h: Math.max(1, node.height - pad * 2) };
  const innerRadius = Math.max(0, node.cornerRadius - pad);

  let imageBox: { x: number; y: number; w: number; h: number } | null = null;
  if (image) {
    const imgRatio = (image.naturalWidth || 1) / (image.naturalHeight || 1);
    const boxRatio = inner.w / inner.h;
    let w: number;
    let h: number;
    if (imgRatio > boxRatio) {
      h = inner.h * node.zoom;
      w = h * imgRatio;
    } else {
      w = inner.w * node.zoom;
      h = w / imgRatio;
    }
    const extraX = w - inner.w;
    const extraY = h - inner.h;
    imageBox = {
      x: inner.x - (extraX * (1 + node.panX)) / 2,
      y: inner.y - (extraY * (1 + node.panY)) / 2,
      w,
      h,
    };
  }

  const labelSize = Math.max(10, Math.min(inner.w, inner.h) * 0.1);

  return (
    <>
      <Rect
        width={node.width}
        height={node.height}
        fill={node.fill}
        stroke={node.strokeWidth > 0 ? node.stroke : undefined}
        strokeWidth={node.strokeWidth}
        cornerRadius={node.cornerRadius}
        {...shadowProps(node.shadow, Math.min(node.width, node.height))}
      />
      <Group
        clipFunc={(ctx) => {
          const r = Math.min(innerRadius, inner.w / 2, inner.h / 2);
          ctx.beginPath();
          ctx.moveTo(inner.x + r, inner.y);
          ctx.arcTo(inner.x + inner.w, inner.y, inner.x + inner.w, inner.y + inner.h, r);
          ctx.arcTo(inner.x + inner.w, inner.y + inner.h, inner.x, inner.y + inner.h, r);
          ctx.arcTo(inner.x, inner.y + inner.h, inner.x, inner.y, r);
          ctx.arcTo(inner.x, inner.y, inner.x + inner.w, inner.y, r);
          ctx.closePath();
        }}
      >
        {image && imageBox ? (
          <KImage image={image} x={imageBox.x} y={imageBox.y} width={imageBox.w} height={imageBox.h} />
        ) : (
          <>
            <Rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} fill="#e9ebf2" />
            {editable ? (
              <KText
                name="placeholder"
                x={inner.x}
                y={inner.y + inner.h / 2 - labelSize * 1.1}
                width={inner.w}
                align="center"
                text={`＋\n${node.placeholder || "Add photo"}`}
                fontSize={labelSize}
                lineHeight={1.15}
                fontFamily={STUDIO_FONTS.inter.family}
                fill="#7a8194"
              />
            ) : null}
          </>
        )}
      </Group>
    </>
  );
}

function TextContent({ node, hidden }: { node: TextNode; hidden: boolean }) {
  return (
    <KText
      text={node.text || " "}
      width={node.width}
      fontFamily={STUDIO_FONTS[node.fontFamily]?.family ?? STUDIO_FONTS.inter.family}
      fontSize={node.fontSize}
      fontStyle={fontStyle(node)}
      textDecoration={node.underline ? "underline" : ""}
      align={node.align}
      lineHeight={node.lineHeight}
      letterSpacing={node.letterSpacing}
      fill={node.fill}
      stroke={node.strokeWidth > 0 ? node.stroke : undefined}
      strokeWidth={node.strokeWidth}
      fillAfterStrokeEnabled
      visible={!hidden}
      {...shadowProps(node.shadow, node.fontSize * 2)}
    />
  );
}

function ShapeContent({ node }: { node: ShapeNode }) {
  const common = {
    fill: node.fill,
    stroke: node.strokeWidth > 0 ? node.stroke : undefined,
    strokeWidth: node.strokeWidth,
    ...shadowProps(node.shadow, Math.min(node.width, node.height)),
  };
  if (node.type === "ellipse") {
    return (
      <Ellipse
        x={node.width / 2}
        y={node.height / 2}
        radiusX={node.width / 2}
        radiusY={node.height / 2}
        {...common}
      />
    );
  }
  return <Rect width={node.width} height={node.height} cornerRadius={node.cornerRadius} {...common} />;
}

function BackgroundImage({ src, width, height }: { src: string; width: number; height: number }) {
  const { image } = useLoadedImage(src);
  if (!image) return null;
  // object-fit: cover via a source crop.
  const iw = image.naturalWidth || 1;
  const ih = image.naturalHeight || 1;
  const scale = Math.max(width / iw, height / ih);
  const cw = width / scale;
  const ch = height / scale;
  return (
    <KImage
      image={image}
      width={width}
      height={height}
      crop={{ x: (iw - cw) / 2, y: (ih - ch) / 2, width: cw, height: ch }}
      name="background"
      listening={false}
    />
  );
}

// ─── Stage ─────────────────────────────────────────────────────────────────

export const CanvasStage = forwardRef<CanvasHandle, Props>(function CanvasStage(
  { doc, scale, mode, readOnly, selectedId, onSelect, onUpdateNode, onDrop, onPhotoRequest },
  ref,
) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [guides, setGuides] = useState<{ v: number | null; h: number | null }>({ v: null, h: null });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [, setFontsReady] = useState(0);

  // Web fonts arrive asynchronously; redraw once they have.
  useEffect(() => {
    let alive = true;
    loadStudioFonts().then(() => {
      if (!alive) return;
      setFontsReady((n) => n + 1);
      layerRef.current?.batchDraw();
    });
    return () => {
      alive = false;
    };
  }, []);

  const selected = doc.nodes.find((n) => n.id === selectedId) ?? null;
  // A locked node with slideY (e.g. a shelf) is still part of the skeleton —
  // no resizing, rotating or deleting — but anyone may slide it up or down.
  const slideOnly = (node: DesignNode) => node.locked && Boolean(node.slideY);
  const canSelect = (node: DesignNode) => !readOnly && (mode === "admin" || !node.locked || slideOnly(node));
  const canMove = (node: DesignNode) => !readOnly && (!node.locked || slideOnly(node));

  // Attach the transformer to the selected node.
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    // Match by function, not a "#id" selector: Konva compares selector ids as
    // raw strings, and escaping (needed for UUIDs starting with a digit) breaks that.
    const target =
      selectedId && !exporting && editingId !== selectedId
        ? stage.findOne((n: Konva.Node) => n.id() === selectedId)
        : null;
    tr.nodes(target ? [target] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, doc, exporting, editingId]);

  useImperativeHandle(
    ref,
    () => ({
      async exportBlob({ maxSide, mimeType = "image/jpeg", quality = 0.92 }) {
        const stage = stageRef.current;
        if (!stage) throw new Error("Canvas not ready");
        setExporting(true);
        setEditingId(null);
        try {
          await loadStudioFonts();
          await Promise.all(docImageUrls(doc).map((src) => loadImage(src).catch(() => null)));
          // Let React re-render now-loaded images and hide the selection UI.
          await new Promise((r) => setTimeout(r, 80));
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          trRef.current?.nodes([]);
          stage.batchDraw();
          const target = maxSide / Math.max(doc.width, doc.height);
          const blob = (await stage.toBlob({
            pixelRatio: target / scale,
            mimeType,
            quality,
          })) as Blob | null;
          if (!blob) throw new Error("Export produced no image");
          return blob;
        } finally {
          setExporting(false);
        }
      },
      sceneSnapshot(maxSide, standing) {
        const stage = stageRef.current;
        const layer = layerRef.current;
        const tr = trRef.current;
        if (!stage || !layer) return null;

        const byId = new Map<string, Konva.Node>();
        for (const n of doc.nodes) {
          const k = stage.findOne((x: Konva.Node) => x.id() === n.id);
          if (k) byId.set(n.id, k);
        }
        const allNodes = [...byId.values()];
        const backgrounds = stage.find(".background");
        const hints = stage.find(".placeholder");
        const wasVisible = new Map<Konva.Node, boolean>(
          [...allNodes, ...backgrounds, ...hints].map((n) => [n, n.visible()]),
        );
        const trVisible = tr?.visible() ?? false;
        const ratio = maxSide / Math.max(doc.width, doc.height) / scale;
        const standingIds = new Set(standing.flatMap((g) => g.ids));

        try {
          tr?.visible(false);
          hints.forEach((n) => n.visible(false));

          // 1) The wall: everything except what stands on the shelves.
          for (const id of standingIds) byId.get(id)?.visible(false);
          const texture = stage.toDataURL({ pixelRatio: ratio, mimeType: "image/jpeg", quality: 0.86 });

          // 2) Each standing group alone, on transparency, without its 2D drop
          //    shadow (the 3D scene casts real ones).
          allNodes.forEach((n) => n.visible(false));
          backgrounds.forEach((n) => n.visible(false));
          const items: StandingItem3D[] = [];
          for (const g of standing) {
            const nodes = g.ids.map((id) => byId.get(id)).filter((n): n is Konva.Node => Boolean(n));
            if (nodes.length === 0) continue;
            nodes.forEach((n) => n.visible(true));
            const shapes = nodes.flatMap((n) =>
              n instanceof Konva.Container ? n.find<Konva.Shape>("Shape") : n instanceof Konva.Shape ? [n] : [],
            );
            const shadowWas = shapes.map((sh) => sh.shadowEnabled());
            shapes.forEach((sh) => sh.shadowEnabled(false));

            const rects = nodes.map((n) => n.getClientRect({ relativeTo: layer, skipShadow: true }));
            const x0 = Math.min(...rects.map((r) => r.x));
            const y0 = Math.min(...rects.map((r) => r.y));
            const x1 = Math.max(...rects.map((r) => r.x + r.width));
            const y1 = Math.max(...rects.map((r) => r.y + r.height));
            const w = Math.max(1, x1 - x0);
            const h = Math.max(1, y1 - y0);
            const itemRatio = Math.min(ratio * 1.5, 1024 / (Math.max(w, h) * scale));
            const url = stage.toDataURL({
              x: x0 * scale,
              y: y0 * scale,
              width: w * scale,
              height: h * scale,
              pixelRatio: itemRatio,
              mimeType: "image/png",
            });

            shapes.forEach((sh, i) => sh.shadowEnabled(shadowWas[i]));
            nodes.forEach((n) => n.visible(false));
            items.push({
              url,
              x: x0 / doc.width,
              y: y0 / doc.height,
              width: w / doc.width,
              height: h / doc.height,
              supportTop: g.supportTop / doc.height,
              shelfIndex: g.shelfIndex,
              level: g.level,
              solid: g.solid,
              edge: g.edge,
            });
          }
          return { texture, shelves: detectShelves(doc), items };
        } catch {
          return null;
        } finally {
          for (const [n, v] of wasVisible) n.visible(v);
          tr?.visible(trVisible);
          stage.batchDraw();
        }
      },
      quickPreview(maxSide) {
        const stage = stageRef.current;
        const tr = trRef.current;
        if (!stage) return null;
        // Hide the selection box only for the duration of this synchronous
        // draw — the browser never paints the hidden state, so no flicker.
        const trVisible = tr?.visible() ?? false;
        tr?.visible(false);
        const hints = stage.find(".placeholder");
        hints.forEach((n) => n.visible(false));
        try {
          const target = maxSide / Math.max(doc.width, doc.height);
          return stage.toDataURL({ pixelRatio: target / scale, mimeType: "image/jpeg", quality: 0.8 });
        } catch {
          return null; // e.g. an image without CORS headers tainted the canvas
        } finally {
          tr?.visible(trVisible);
          hints.forEach((n) => n.visible(true));
          stage.batchDraw();
        }
      },
    }),
    [doc, scale],
  );

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const layer = node.getLayer();
      if (!layer) return;
      const verticalOnly = Boolean((node as Konva.Node).getAttr("slideOnly"));
      const box = node.getClientRect({ relativeTo: layer, skipShadow: true });
      const threshold = SNAP_PX / scale;
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      let v: number | null = null;
      let h: number | null = null;

      const xTargets = [doc.width / 2, 0, doc.width];
      const xEdges = [cx, box.x, box.x + box.width];
      outerX: for (const t of verticalOnly ? [] : xTargets) {
        for (const edge of xEdges) {
          if (Math.abs(edge - t) < threshold) {
            node.x(node.x() + (t - edge));
            v = t;
            break outerX;
          }
        }
      }
      // Shelf tops too, so items "click" onto a shelf (and then stand on it in 3D).
      const yTargets = [doc.height / 2, 0, doc.height, ...detectShelves(doc).map((s) => s.y * doc.height)];
      const yEdges = [cy, box.y, box.y + box.height];
      outerY: for (const t of yTargets) {
        for (const edge of yEdges) {
          if (Math.abs(edge - t) < threshold) {
            node.y(node.y() + (t - edge));
            h = t;
            break outerY;
          }
        }
      }
      setGuides((g) => (g.v === v && g.h === h ? g : { v, h }));
    },
    [doc, scale],
  );

  function handleTransformEnd(node: DesignNode, e: Konva.KonvaEventObject<Event>) {
    const g = e.target;
    const sx = g.scaleX();
    const sy = g.scaleY();
    g.scale({ x: 1, y: 1 });
    const base = { x: g.x(), y: g.y(), rotation: g.rotation() };

    if (node.type === "text") {
      const fontChanged = Math.abs(sy - 1) > 0.001;
      onUpdateNode(node.id, {
        ...base,
        width: Math.max(MIN_SIZE * 4, node.width * sx),
        fontSize: fontChanged ? Math.min(800, Math.max(4, node.fontSize * sy)) : node.fontSize,
      });
      return;
    }
    onUpdateNode(node.id, {
      ...base,
      width: Math.max(MIN_SIZE, node.width * sx),
      height: Math.max(MIN_SIZE, node.height * sy),
    });
  }

  function handleStageDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    const target = e.target;
    if (target === target.getStage() || target.name() === "background") onSelect(null);
  }

  function handleDomDrop(e: React.DragEvent<HTMLDivElement>) {
    const raw = e.dataTransfer.getData(DRAG_MIME);
    if (!raw || readOnly) return;
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointersPositions(e.nativeEvent);
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    try {
      onDrop(JSON.parse(raw) as DropPayload, { x: pointer.x / scale, y: pointer.y / scale });
    } catch {
      /* ignore malformed drags */
    }
  }

  const editingNode = editingId ? (doc.nodes.find((n) => n.id === editingId) as TextNode | undefined) : undefined;
  const transformerIsText = selected?.type === "text";

  return (
    <div
      className="relative"
      style={{ width: doc.width * scale, height: doc.height * scale }}
      onDragOver={(e) => {
        if (!readOnly && e.dataTransfer.types.includes(DRAG_MIME)) e.preventDefault();
      }}
      onDrop={handleDomDrop}
    >
      <Stage
        ref={stageRef}
        width={doc.width * scale}
        height={doc.height * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageDown}
        onTouchStart={handleStageDown}
      >
        <Layer ref={layerRef}>
          <Rect name="background" x={0} y={0} width={doc.width} height={doc.height} fill={doc.background.color} />
          {doc.background.imageUrl ? (
            <BackgroundImage src={doc.background.imageUrl} width={doc.width} height={doc.height} />
          ) : null}

          {doc.nodes.map((node) => {
            const selectable = canSelect(node);
            return (
              <Group
                key={node.id}
                id={node.id}
                x={node.x}
                y={node.y}
                rotation={node.rotation}
                opacity={node.opacity}
                listening={selectable}
                draggable={selectable && canMove(node)}
                slideOnly={slideOnly(node)}
                dragBoundFunc={
                  slideOnly(node)
                    ? (pos) => ({
                        x: node.x * scale,
                        y: Math.min(Math.max(pos.y, 0), Math.max(0, doc.height - node.height) * scale),
                      })
                    : undefined
                }
                onMouseDown={() => selectable && onSelect(node.id)}
                onTouchStart={() => selectable && onSelect(node.id)}
                onDragStart={() => onSelect(node.id)}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
                  setGuides({ v: null, h: null });
                  onUpdateNode(node.id, { x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={(e) => handleTransformEnd(node, e)}
                onDblClick={() => {
                  if (!selectable || node.locked) return;
                  if (node.type === "text") setEditingId(node.id);
                  if (node.type === "photo") onPhotoRequest(node.id);
                }}
                onDblTap={() => {
                  if (!selectable || node.locked) return;
                  if (node.type === "text") setEditingId(node.id);
                  if (node.type === "photo") onPhotoRequest(node.id);
                }}
                onMouseEnter={(e) => {
                  const c = e.target.getStage()?.container();
                  if (c && selectable) c.style.cursor = slideOnly(node) ? "ns-resize" : canMove(node) ? "move" : "pointer";
                }}
                onMouseLeave={(e) => {
                  const c = e.target.getStage()?.container();
                  if (c) c.style.cursor = "default";
                }}
              >
                {node.type === "image" ? <ImageContent node={node} /> : null}
                {node.type === "photo" ? <PhotoContent node={node} editable={!exporting} /> : null}
                {node.type === "text" ? <TextContent node={node} hidden={editingId === node.id} /> : null}
                {node.type === "rect" || node.type === "ellipse" ? <ShapeContent node={node} /> : null}
              </Group>
            );
          })}

          {guides.v !== null && !exporting ? (
            <Line points={[guides.v, 0, guides.v, doc.height]} stroke="#d946ef" strokeWidth={1 / scale} listening={false} />
          ) : null}
          {guides.h !== null && !exporting ? (
            <Line points={[0, guides.h, doc.width, guides.h]} stroke="#d946ef" strokeWidth={1 / scale} listening={false} />
          ) : null}

          <Transformer
            ref={trRef}
            visible={!exporting}
            rotateEnabled={!!selected && !selected.locked}
            resizeEnabled={!!selected && !selected.locked}
            keepRatio={selected?.type === "image" || selected?.type === "photo"}
            enabledAnchors={
              transformerIsText
                ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
                : undefined
            }
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={4}
            anchorSize={10}
            anchorCornerRadius={5}
            anchorStroke="#a67c3d"
            borderStroke="#a67c3d"
            borderStrokeWidth={1.5}
            borderDash={selected?.locked ? [4, 4] : undefined}
            ignoreStroke
            boundBoxFunc={(oldBox, newBox) =>
              Math.abs(newBox.width) < MIN_SIZE * scale || Math.abs(newBox.height) < MIN_SIZE * scale ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>

      {editingNode ? (
        <InlineTextEditor
          key={editingNode.id}
          node={editingNode}
          scale={scale}
          onDone={(text) => {
            setEditingId(null);
            if (text !== editingNode.text) onUpdateNode(editingNode.id, { text });
          }}
        />
      ) : null}
    </div>
  );
});

function InlineTextEditor({
  node,
  scale,
  onDone,
}: {
  node: TextNode;
  scale: number;
  onDone: (text: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(node.text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      maxLength={500}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onDone(value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          onDone(value);
        }
      }}
      className="absolute z-10 resize-none overflow-hidden border border-dashed border-gold bg-white/70 p-0 outline-none"
      style={{
        left: node.x * scale,
        top: node.y * scale,
        width: node.width * scale,
        fontFamily: STUDIO_FONTS[node.fontFamily]?.family,
        fontSize: node.fontSize * scale,
        fontWeight: node.bold ? 700 : 400,
        fontStyle: node.italic ? "italic" : "normal",
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing * scale,
        textAlign: node.align,
        color: node.fill,
        transform: `rotate(${node.rotation}deg)`,
        transformOrigin: "top left",
      }}
    />
  );
}
