"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Redo2, Undo2, ZoomIn, ZoomOut, Maximize, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/image-compress";
import {
  MAX_UPLOADS,
  cloneNode,
  emptyPhotoSlots,
  makeImage,
  makePhoto,
  makeShape,
  makeText,
  type DesignDoc,
  type DesignNode,
  type PhotoNode,
} from "@/lib/studio/doc";
import { STUDIO_FONTS } from "@/components/studio/fonts";
import { useDesignState } from "@/components/studio/editor/useDesignState";
import { CanvasStage, type CanvasHandle, type DropPayload } from "@/components/studio/editor/CanvasStage";
import { Sidebar, type ShapePreset, type StudioElement, type TextPreset } from "@/components/studio/editor/Sidebar";
import { PropertiesPanel } from "@/components/studio/editor/PropertiesPanel";
import { MugMockup } from "@/components/studio/editor/MugMockup";
import { imageNaturalSize } from "@/components/studio/editor/images";

export interface EditorApi {
  /** Current document and its revision number (pass the revision back to markSaved). */
  snapshot(): { doc: DesignDoc; revision: number };
  exportBlob: CanvasHandle["exportBlob"];
  markSaved(revision: number): void;
  notify(kind: "success" | "error", text: string): void;
  dirty: boolean;
  emptySlots: number;
}

export interface DesignEditorProps {
  mode: "admin" | "customer";
  initialDoc: DesignDoc;
  elements: StudioElement[];
  kind: "STANDARD" | "MUG";
  uploadEndpoint: string;
  readOnly?: boolean;
  /** Left side of the top bar (title, back link…). */
  header: ReactNode;
  /** Right side of the top bar (Save / Add to cart…), given access to the editor. */
  renderActions: (api: EditorApi) => ReactNode;
  /** Extra panel content above the properties (e.g. admin template settings). */
  aside?: ReactNode;
  className?: string;
}

type Toast = { kind: "success" | "error"; text: string } | null;

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.8, 1, 1.25, 1.5, 2, 3];

export function DesignEditor({
  mode,
  initialDoc,
  elements,
  kind,
  uploadEndpoint,
  readOnly = false,
  header,
  renderActions,
  aside,
  className,
}: DesignEditorProps) {
  const state = useDesignState(initialDoc);
  const { doc, selected, selectedId, revision, select, updateNode, addNode, removeNode, reorder, commit } = state;

  // Held in state (via a callback ref) so the page-level action API never reads a ref during render.
  const [canvas, setCanvas] = useState<CanvasHandle | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<string | null>(null);
  const latest = useRef({ doc, revision });

  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [savedRevision, setSavedRevision] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [mugPreview, setMugPreview] = useState<string | null>(null);

  useEffect(() => {
    latest.current = { doc, revision };
  }, [doc, revision]);

  const dirty = revision !== savedRevision;
  const emptySlots = emptyPhotoSlots(doc);

  // ── Fit-to-screen scale ──────────────────────────────────────────────────
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setAreaSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitScale = useMemo(() => {
    if (!areaSize.w || !areaSize.h) return 0;
    const pad = 32;
    return Math.max(0.05, Math.min((areaSize.w - pad) / doc.width, (areaSize.h - pad) / doc.height));
  }, [areaSize, doc.width, doc.height]);
  const scale = fitScale * zoom;

  // ── Notifications ────────────────────────────────────────────────────────
  const notify = useCallback((kindArg: "success" | "error", text: string) => setToast({ kind: kindArg, text }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "error" ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Unsaved-changes guard ────────────────────────────────────────────────
  useEffect(() => {
    if (!dirty || readOnly) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, readOnly]);

  // ── Live mug preview ─────────────────────────────────────────────────────
  useEffect(() => {
    if (kind !== "MUG" || !scale) return;
    const t = setTimeout(() => setMugPreview(canvas?.quickPreview(1000) ?? null), 450);
    return () => clearTimeout(t);
  }, [canvas, kind, revision, scale]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isEditable = useCallback(
    (node: DesignNode) => !readOnly && (mode === "admin" || !node.locked),
    [mode, readOnly],
  );

  const rememberUploads = useCallback(
    (urls: string[]) =>
      commit((d) => {
        const merged = [...d.uploads.filter((u) => !urls.includes(u)), ...urls];
        return { ...d, uploads: merged.slice(-MAX_UPLOADS) };
      }),
    [commit],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.append("file", compressed);
      const res = await fetch(uploadEndpoint, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.url !== "string") throw new Error(data.error ?? "Upload failed.");
      return data.url as string;
    },
    [uploadEndpoint],
  );

  /** Puts a photo into a frame: the given one, the selected one, or the next empty one; else adds it loose. */
  const placePhoto = useCallback(
    async (src: string, slotId?: string | null, point?: { x: number; y: number }) => {
      const d = latest.current.doc;
      const candidates = d.nodes.filter((n): n is PhotoNode => n.type === "photo" && isEditable(n));
      const target =
        (slotId && candidates.find((n) => n.id === slotId)) ||
        (selected?.type === "photo" && isEditable(selected) ? (selected as PhotoNode) : undefined) ||
        (!point ? candidates.find((n) => !n.src) : undefined);

      if (target) {
        updateNode(target.id, { src, zoom: 1, panX: 0, panY: 0 });
        select(target.id);
        return;
      }
      try {
        const natural = await imageNaturalSize(src);
        const node = makeImage(d, src, natural);
        if (point) {
          node.x = Math.round(point.x - node.width / 2);
          node.y = Math.round(point.y - node.height / 2);
        }
        addNode(node);
      } catch {
        notify("error", "Couldn't load that image.");
      }
    },
    [addNode, isEditable, notify, select, selected, updateNode],
  );

  const handleUploadPhotos = useCallback(
    async (files: File[], slotId?: string | null) => {
      if (readOnly) return;
      setUploading(true);
      const urls: string[] = [];
      try {
        for (const file of files) urls.push(await uploadFile(file));
      } catch (err) {
        notify("error", err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
      if (urls.length === 0) return;
      rememberUploads(urls);
      if (slotId) {
        await placePhoto(urls[0], slotId);
      } else if (files.length === 1) {
        await placePhoto(urls[0]);
      } else {
        notify("success", `${urls.length} photos uploaded — click or drag them onto your frames.`);
      }
    },
    [notify, readOnly, rememberUploads, uploadFile, placePhoto],
  );

  const requestPhotoForSlot = useCallback((nodeId: string) => {
    pendingSlotRef.current = nodeId;
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    async (payload: DropPayload, point: { x: number; y: number }) => {
      if (payload.kind === "photo") {
        // Topmost editable frame under the drop point gets the photo.
        const slot = [...latest.current.doc.nodes]
          .reverse()
          .find(
            (n): n is PhotoNode =>
              n.type === "photo" &&
              isEditable(n) &&
              point.x >= n.x &&
              point.x <= n.x + n.width &&
              point.y >= n.y &&
              point.y <= n.y + n.height,
          );
        await placePhoto(payload.src, slot?.id ?? null, slot ? undefined : point);
        return;
      }
      try {
        const natural = await imageNaturalSize(payload.src);
        const node = makeImage(latest.current.doc, payload.src, natural);
        node.x = Math.round(point.x - node.width / 2);
        node.y = Math.round(point.y - node.height / 2);
        addNode(node);
      } catch {
        notify("error", "Couldn't load that element.");
      }
    },
    [addNode, isEditable, notify, placePhoto],
  );

  const addElement = useCallback(
    async (src: string) => {
      try {
        const natural = await imageNaturalSize(src);
        addNode(makeImage(latest.current.doc, src, natural));
      } catch {
        notify("error", "Couldn't load that element.");
      }
    },
    [addNode, notify],
  );

  const addText = useCallback(
    (preset: TextPreset) => {
      const m = Math.min(doc.width, doc.height);
      const presets = {
        heading: { text: "Add a heading", fontFamily: "playfair", fontSize: Math.round(m * 0.08), bold: true },
        subheading: { text: "Add a subheading", fontFamily: "poppins", fontSize: Math.round(m * 0.05), bold: true },
        body: { text: "Add a little bit of body text", fontFamily: "inter", fontSize: Math.round(m * 0.035), bold: false },
        script: { text: "With love", fontFamily: "greatVibes", fontSize: Math.round(m * 0.08), bold: false },
      } as const;
      addNode(makeText(doc, { ...presets[preset] }));
    },
    [addNode, doc],
  );

  const addShape = useCallback(
    (preset: ShapePreset) => {
      const m = Math.min(doc.width, doc.height);
      if (preset === "photo") return addNode(makePhoto(doc));
      if (preset === "circle") return addNode(makeShape(doc, "ellipse"));
      if (preset === "rounded") return addNode(makeShape(doc, "rect", { cornerRadius: Math.round(m * 0.04) }));
      if (preset === "line") {
        return addNode(
          makeShape(doc, "rect", {
            width: Math.round(doc.width * 0.8),
            height: Math.max(6, Math.round(doc.height * 0.015)),
            fill: "#ffffff",
            stroke: "#d7d8e3",
            strokeWidth: 1,
            shadow: true,
            x: Math.round(doc.width * 0.1),
          }),
        );
      }
      addNode(makeShape(doc, "rect"));
    },
    [addNode, doc],
  );

  const setBackground = useCallback(
    (patch: Partial<DesignDoc["background"]>) =>
      commit((d) => ({ ...d, background: { ...d.background, ...patch } }), { key: "background" }),
    [commit],
  );

  const uploadBackground = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const url = await uploadFile(file);
        setBackground({ imageUrl: url });
      } catch (err) {
        notify("error", err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [notify, setBackground, uploadFile],
  );

  const duplicateSelected = useCallback(() => {
    if (!selected || !isEditable(selected)) return;
    addNode(cloneNode(selected, Math.round(Math.min(doc.width, doc.height) * 0.03)));
  }, [addNode, doc.height, doc.width, isEditable, selected]);

  const deleteSelected = useCallback(() => {
    if (!selected || !isEditable(selected)) return;
    removeNode(selected.id);
  }, [isEditable, removeNode, selected]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        state.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (e.key === "Escape") return select(null);
      if (!selected || !isEditable(selected)) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = moves[e.key];
      if (move && !selected.locked) {
        e.preventDefault();
        updateNode(selected.id, { x: selected.x + move[0], y: selected.y + move[1] }, "nudge");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, duplicateSelected, isEditable, readOnly, select, selected, state, updateNode]);

  // ── API for page-level actions ───────────────────────────────────────────
  const api: EditorApi = {
    snapshot: () => ({ doc, revision }),
    exportBlob: (opts) => {
      if (!canvas) return Promise.reject(new Error("Canvas not ready"));
      return canvas.exportBlob(opts);
    },
    markSaved: (rev) => setSavedRevision(rev),
    notify,
    dirty,
    emptySlots,
  };

  const zoomBy = (dir: 1 | -1) =>
    setZoom((z) => {
      const idx = ZOOM_STEPS.findIndex((s) => s >= z - 0.001);
      const next = ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, (idx === -1 ? 5 : idx) + dir))];
      return next;
    });

  const fontClasses = Object.values(STUDIO_FONTS)
    .map((f) => f.className)
    .join(" ");

  return (
    <div className={cn("flex flex-col bg-paper lg:h-full", className)}>
      {/* Hidden spans make sure every studio @font-face is registered with the page. */}
      <div aria-hidden className={cn("pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0", fontClasses)}>
        {Object.values(STUDIO_FONTS).map((f) => (
          <span key={f.label} className={f.className}>
            Aa
          </span>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          const slot = pendingSlotRef.current;
          pendingSlotRef.current = null;
          if (file) handleUploadPhotos([file], slot);
        }}
      />

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">{header}</div>
        <div className="flex items-center gap-1">
          <ToolButton label="Undo (Ctrl+Z)" onClick={state.undo} disabled={!state.canUndo || readOnly}>
            <Undo2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Redo (Ctrl+Shift+Z)" onClick={state.redo} disabled={!state.canRedo || readOnly}>
            <Redo2 className="h-4 w-4" />
          </ToolButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolButton label="Zoom out" onClick={() => zoomBy(-1)}>
            <ZoomOut className="h-4 w-4" />
          </ToolButton>
          <span className="w-12 text-center text-xs text-navy tabular-nums">{Math.round(zoom * 100)}%</span>
          <ToolButton label="Zoom in" onClick={() => zoomBy(1)}>
            <ZoomIn className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Fit to screen" onClick={() => setZoom(1)}>
            <Maximize className="h-4 w-4" />
          </ToolButton>
        </div>
        <div className="flex items-center gap-2">{renderActions(api)}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {!readOnly ? (
          <aside className="order-2 max-h-[46vh] border-t border-border lg:order-1 lg:max-h-none lg:border-t-0 lg:border-r">
            <Sidebar
              mode={mode}
              doc={doc}
              elements={elements}
              uploading={uploading}
              onAddElement={addElement}
              onUploadPhotos={(files) => handleUploadPhotos(files)}
              onUsePhoto={(src) => placePhoto(src)}
              onAddText={addText}
              onAddShape={addShape}
              onBackground={setBackground}
              onUploadBackground={uploadBackground}
            />
          </aside>
        ) : null}

        <div
          ref={areaRef}
          className="relative order-1 h-[58vh] min-w-0 flex-1 overflow-auto bg-[#ebe7df] lg:order-2 lg:h-auto"
        >
          <div className="flex min-h-full min-w-full p-4">
            <div className="m-auto shadow-[0_18px_40px_-18px_rgba(30,42,74,0.45)]">
              {scale > 0 ? (
                <CanvasStage
                  ref={setCanvas}
                  doc={doc}
                  scale={scale}
                  mode={mode}
                  readOnly={readOnly}
                  selectedId={selectedId}
                  onSelect={select}
                  onUpdateNode={updateNode}
                  onDrop={handleDrop}
                  onPhotoRequest={requestPhotoForSlot}
                />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
              )}
            </div>
          </div>

          {uploading ? (
            <div className="pointer-events-none sticky bottom-3 left-0 mx-auto flex w-fit items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm text-cream shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </div>
          ) : null}
          {toast ? (
            <div
              role="status"
              className={cn(
                "sticky bottom-3 left-0 mx-auto flex w-fit max-w-[90%] items-center gap-2 rounded-full px-4 py-2 text-sm shadow-lg",
                toast.kind === "error" ? "bg-error text-cream" : "bg-success text-cream",
              )}
            >
              {toast.kind === "error" ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {toast.text}
            </div>
          ) : null}
        </div>

        <aside className="order-3 overflow-y-auto border-t border-border lg:w-[290px] lg:border-t-0 lg:border-l">
          {aside}
          {kind === "MUG" ? (
            <div className="border-b border-border p-4">
              <p className="mb-3 font-display text-base text-navy">Mug preview</p>
              <MugMockup imageUrl={mugPreview} aspect={doc.width / doc.height} />
            </div>
          ) : null}
          {readOnly ? (
            <p className="p-4 text-sm text-muted">This design is part of an order, so it can no longer be edited.</p>
          ) : (
            <PropertiesPanel
              node={selected}
              mode={mode}
              emptySlots={emptySlots}
              onChange={(patch, key) => selected && updateNode(selected.id, patch, key)}
              onDelete={deleteSelected}
              onDuplicate={duplicateSelected}
              onReorder={(to) => selected && reorder(selected.id, to)}
              onReplacePhoto={() => selected && requestPhotoForSlot(selected.id)}
              onDeselect={() => select(null)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream-dark disabled:opacity-35"
    >
      {children}
    </button>
  );
}
