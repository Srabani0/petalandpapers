"use client";

/* eslint-disable @next/next/no-img-element -- thumbnails of user/admin uploads; next/image adds nothing here */

import { useMemo, useRef, useState } from "react";
import {
  Shapes,
  ImagePlus,
  Type,
  Square,
  Circle,
  RectangleHorizontal,
  Frame,
  PaintBucket,
  Sticker,
  Loader2,
  Lock,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesignDoc } from "@/lib/studio/doc";
import { STUDIO_FONTS } from "@/components/studio/fonts";
import { DRAG_MIME, type DropPayload } from "@/components/studio/editor/CanvasStage";

export type TextPreset = "heading" | "subheading" | "body" | "script";
export type ShapePreset = "rect" | "rounded" | "circle" | "line" | "photo";

export interface StudioElement {
  id: string;
  name: string;
  group: string;
  imageUrl: string;
}

const TABS = [
  { key: "elements", label: "Elements", icon: Sticker },
  { key: "photos", label: "Photos", icon: ImagePlus },
  { key: "text", label: "Text", icon: Type },
  { key: "shapes", label: "Shapes", icon: Shapes },
  { key: "background", label: "Background", icon: PaintBucket },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const SWATCHES = [
  "#ffffff", "#faf6ee", "#f3d9de", "#e8e9f3", "#dfe8f5", "#e3efe1", "#fff4d6", "#f2ead9",
  "#1e2a4a", "#34456b", "#a67c3d", "#8a9a87", "#c98fa0", "#c0392b", "#2c3e50", "#000000",
];

function dragProps(payload: DropPayload) {
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "copy";
    },
  };
}

export function Sidebar({
  mode,
  doc,
  elements,
  uploading,
  onAddElement,
  onUploadPhotos,
  onUsePhoto,
  onAddText,
  onAddShape,
  onBackground,
  onUploadBackground,
}: {
  mode: "admin" | "customer";
  doc: DesignDoc;
  elements: StudioElement[];
  uploading: boolean;
  onAddElement: (src: string) => void;
  onUploadPhotos: (files: File[]) => void;
  onUsePhoto: (src: string) => void;
  onAddText: (preset: TextPreset) => void;
  onAddShape: (preset: ShapePreset) => void;
  onBackground: (patch: Partial<DesignDoc["background"]>) => void;
  onUploadBackground: (file: File) => void;
}) {
  const [tab, setTab] = useState<TabKey>(elements.length > 0 ? "elements" : "photos");
  const photoInput = useRef<HTMLInputElement>(null);
  const bgInput = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => {
    const map = new Map<string, StudioElement[]>();
    for (const el of elements) {
      const list = map.get(el.group) ?? [];
      list.push(el);
      map.set(el.group, list);
    }
    return [...map.entries()];
  }, [elements]);

  const bgLocked = mode === "customer" && doc.background.locked;

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-1.5 lg:w-[72px] lg:flex-col lg:border-r lg:border-b-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-colors",
              tab === key ? "bg-navy text-cream" : "text-navy/70 hover:bg-cream-dark",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 lg:w-[248px]">
        {tab === "elements" ? (
          groups.length === 0 ? (
            <p className="text-sm text-muted">
              {mode === "admin"
                ? "No elements yet. Upload stickers and props for this category from the category page."
                : "No stickers for this category yet — try Text, Shapes or your own Photos."}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted">Click to add, or drag onto your design.</p>
              {groups.map(([group, items]) => (
                <section key={group}>
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-navy uppercase">{group}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map((el) => (
                      <button
                        key={el.id}
                        type="button"
                        title={el.name}
                        onClick={() => onAddElement(el.imageUrl)}
                        {...dragProps({ kind: "image", src: el.imageUrl })}
                        className="flex aspect-square items-center justify-center rounded-md border border-border bg-[repeating-conic-gradient(#f4f1ea_0_25%,#fff_0_50%)] bg-[length:12px_12px] p-1.5 transition hover:border-gold"
                      >
                        <img src={el.imageUrl} alt={el.name} className="max-h-full max-w-full object-contain" />
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : null}

        {tab === "photos" ? (
          <div className="flex flex-col gap-3">
            <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) onUploadPhotos(files);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => photoInput.current?.click()}
              className="flex items-center justify-center gap-2 rounded-md bg-gold px-3 py-2.5 text-sm font-medium text-cream hover:bg-gold-dark disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Upload photos"}
            </button>
            <p className="text-xs text-muted">
              Click a photo to fill the selected (or next empty) frame, or drag it straight onto any frame.
            </p>
            {doc.uploads.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {[...doc.uploads].reverse().map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => onUsePhoto(src)}
                    {...dragProps({ kind: "photo", src })}
                    className="aspect-square overflow-hidden rounded-md border border-border transition hover:border-gold"
                  >
                    <img src={src} alt="Your upload" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted">
                Your uploaded photos will appear here.
              </p>
            )}
          </div>
        ) : null}

        {tab === "text" ? (
          <div className="flex flex-col gap-2">
            <TextButton label="Add a heading" font="playfair" size="text-xl font-bold" onClick={() => onAddText("heading")} />
            <TextButton label="Add a subheading" font="poppins" size="text-base font-semibold" onClick={() => onAddText("subheading")} />
            <TextButton label="Add body text" font="inter" size="text-sm" onClick={() => onAddText("body")} />
            <TextButton label="Add script text" font="greatVibes" size="text-2xl" onClick={() => onAddText("script")} />
            <p className="mt-2 text-xs text-muted">Double-click any text on the design to type directly.</p>
          </div>
        ) : null}

        {tab === "shapes" ? (
          <div className="grid grid-cols-2 gap-2">
            <ShapeButton icon={Frame} label="Photo frame" onClick={() => onAddShape("photo")} />
            <ShapeButton icon={Square} label="Square" onClick={() => onAddShape("rect")} />
            <ShapeButton icon={RectangleHorizontal} label="Rounded" onClick={() => onAddShape("rounded")} />
            <ShapeButton icon={Circle} label="Circle" onClick={() => onAddShape("circle")} />
            <ShapeButton icon={Minus} label="Line / shelf" onClick={() => onAddShape("line")} />
          </div>
        ) : null}

        {tab === "background" ? (
          bgLocked ? (
            <p className="flex items-start gap-2 text-sm text-muted">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              The background is part of this template&apos;s design.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-navy uppercase">Colour</h3>
                <div className="grid grid-cols-8 gap-1.5">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Background ${c}`}
                      onClick={() => onBackground({ color: c })}
                      className={cn(
                        "aspect-square rounded-full border",
                        doc.background.color.toLowerCase() === c ? "ring-2 ring-gold ring-offset-1" : "border-border",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-navy">
                  <input
                    type="color"
                    value={doc.background.color.slice(0, 7)}
                    onChange={(e) => onBackground({ color: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                  />
                  Custom colour
                </label>
              </div>

              {mode === "admin" ? (
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <h3 className="text-xs font-semibold tracking-wide text-navy uppercase">Background image</h3>
                  <input
                    ref={bgInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) onUploadBackground(file);
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => bgInput.current?.click()}
                    className="rounded-md border border-navy px-3 py-2 text-sm text-navy hover:bg-navy hover:text-cream disabled:opacity-60"
                  >
                    {doc.background.imageUrl ? "Replace image" : "Upload image"}
                  </button>
                  {doc.background.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => onBackground({ imageUrl: null })}
                      className="text-left text-sm text-error underline underline-offset-2"
                    >
                      Remove background image
                    </button>
                  ) : null}
                  <label className="mt-2 flex items-center gap-2 text-sm text-navy">
                    <input
                      type="checkbox"
                      checked={doc.background.locked}
                      onChange={(e) => onBackground({ locked: e.target.checked })}
                    />
                    Lock background for customers
                  </label>
                </div>
              ) : null}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function TextButton({
  label,
  font,
  size,
  onClick,
}: {
  label: string;
  font: keyof typeof STUDIO_FONTS;
  size: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border border-border bg-paper px-3 py-3 text-left text-navy transition hover:border-gold",
        size,
      )}
      style={{ fontFamily: STUDIO_FONTS[font].family }}
    >
      {label}
    </button>
  );
}

function ShapeButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-md border border-border bg-paper px-2 py-3 text-xs text-navy transition hover:border-gold"
    >
      <Icon className="h-6 w-6 text-gold-dark" />
      {label}
    </button>
  );
}
