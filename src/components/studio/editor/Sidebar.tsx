"use client";

/* eslint-disable @next/next/no-img-element -- thumbnails of user/admin uploads; next/image adds nothing here */

import { useRef, useState, type ReactNode } from "react";
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
  Images,
  X,
  Sparkles,
  QrCode,
  Moon,
  Star,
  Heart,
  CircleUser,
  Spline,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesignDoc } from "@/lib/studio/doc";
import { STUDIO_FONTS } from "@/components/studio/fonts";
import { DRAG_MIME, type DropPayload } from "@/components/studio/editor/CanvasStage";
import { BackgroundsGallery, StickersPanel } from "@/components/studio/editor/LibraryPanels";
import { StockPanel, useStockAvailable } from "@/components/studio/editor/StockPanel";

export type TextPreset = "heading" | "subheading" | "body" | "script";
export type ShapePreset = "rect" | "rounded" | "circle" | "line" | "photo";
export type SmartPreset = "starmap" | "moon" | "qr" | "curved" | "heartPhoto" | "circlePhoto";

export interface StudioElement {
  id: string;
  name: string;
  group: string;
  imageUrl: string;
}

const TABS = [
  { key: "elements", label: "Stickers", icon: Sticker },
  { key: "magic", label: "Magic", icon: Sparkles },
  { key: "images", label: "Images", icon: Images },
  { key: "photos", label: "Uploads", icon: ImagePlus },
  { key: "text", label: "Text", icon: Type },
  { key: "shapes", label: "Shapes", icon: Shapes },
  { key: "background", label: "Backdrop", icon: PaintBucket },
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
  onAddSmart,
  onBackground,
  onUploadBackground,
  mobileOpen,
  onMobileOpenChange,
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
  onAddSmart: (preset: SmartPreset) => void;
  onBackground: (patch: Partial<DesignDoc["background"]>) => void;
  onUploadBackground: (file: File) => void;
  /** Phones: whether the panel is open as a bottom sheet over the canvas. */
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<TabKey>("elements");
  const swipe = useRef<number | null>(null);

  const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  const pickTab = (key: TabKey) => {
    if (isPhone() && key === tab && mobileOpen) return onMobileOpenChange(false);
    setTab(key);
    onMobileOpenChange(true);
  };
  /** On phones, close the sheet after adding something so the result is visible. */
  const thenClose =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    (...args: A) => {
      fn(...args);
      if (isPhone()) onMobileOpenChange(false);
    };
  const addElement = thenClose(onAddElement);
  const pickPhoto = thenClose(onUsePhoto);
  const addText = thenClose(onAddText);
  const addShape = thenClose(onAddShape);
  const addSmart = thenClose(onAddSmart);
  const photoInput = useRef<HTMLInputElement>(null);
  const bgInput = useRef<HTMLInputElement>(null);


  const bgLocked = mode === "customer" && doc.background.locked;
  const stockOn = useStockAvailable();
  const tabs = TABS.filter((t) => t.key !== "images" || stockOn);

  return (
    <div className="contents lg:flex lg:h-full lg:min-h-0 lg:flex-row">
      {/* Phones: app-style bottom tab bar. Desktop: vertical rail. */}
      <nav className="relative z-40 order-3 flex h-[var(--tabbar-h)] shrink-0 items-start justify-around border-t border-border bg-paper px-1 pt-1.5 pb-[env(safe-area-inset-bottom)] lg:order-none lg:h-auto lg:w-[72px] lg:flex-col lg:items-stretch lg:justify-start lg:gap-1 lg:border-t-0 lg:border-r lg:p-1.5">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => pickTab(key)}
              aria-pressed={active}
              className={cn(
                "group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 text-[10.5px] font-medium transition-colors lg:flex-none lg:rounded-md lg:px-2 lg:py-2 lg:text-[11px]",
                active ? "text-navy lg:bg-navy lg:text-cream" : "text-navy/60 hover:bg-cream-dark lg:text-navy/70",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 group-active:scale-90 lg:h-auto lg:w-auto",
                  active && mobileOpen ? "bg-navy text-cream lg:bg-transparent" : active ? "bg-navy/10 lg:bg-transparent" : "",
                )}
              >
                <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
              </span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Phones: bottom sheet over the canvas. Desktop: side panel. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-[var(--tabbar-h)] z-30 flex h-[min(60dvh,540px)] flex-col rounded-t-[22px] border-t border-border bg-paper shadow-[0_-14px_36px_-14px_rgba(30,42,74,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          mobileOpen ? "translate-y-0" : "pointer-events-none translate-y-[calc(100%+var(--tabbar-h))]",
          "lg:pointer-events-auto lg:static lg:z-auto lg:h-auto lg:min-h-0 lg:w-[304px] lg:translate-y-0 lg:rounded-none lg:border-t-0 lg:shadow-none lg:transition-none",
        )}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center px-4 pt-2 pb-1 lg:hidden"
          onTouchStart={(e) => (swipe.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (swipe.current !== null && e.changedTouches[0].clientY - swipe.current > 50) onMobileOpenChange(false);
            swipe.current = null;
          }}
        >
          <span className="h-1.5 w-10 rounded-full bg-border" />
          <div className="mt-1.5 flex w-full items-center justify-between">
            <p className="font-display text-base text-navy">{tabs.find((t) => t.key === tab)?.label}</p>
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              aria-label="Close panel"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-dark text-navy active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        {tab === "elements" ? <StickersPanel categoryStickers={elements} onAdd={addElement} /> : null}

        {tab === "images" && stockOn ? <StockPanel onAdd={addElement} /> : null}

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
                    onClick={() => pickPhoto(src)}
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
            <TextButton label="Add a heading" font="playfair" size="text-xl font-bold" onClick={() => addText("heading")} />
            <TextButton label="Add a subheading" font="poppins" size="text-base font-semibold" onClick={() => addText("subheading")} />
            <TextButton label="Add body text" font="inter" size="text-sm" onClick={() => addText("body")} />
            <TextButton label="Add script text" font="greatVibes" size="text-2xl" onClick={() => addText("script")} />
            <p className="mt-2 text-xs text-muted">Double-click any text on the design to type directly.</p>
          </div>
        ) : null}

        {tab === "magic" ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-xs text-muted">Special touches that make a gift personal.</p>
            <MagicCard
              onClick={() => addSmart("starmap")}
              title="Star map"
              text="The real night sky on your special date and place."
              art={
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#141c38]">
                  {[[30, 30], [62, 24], [48, 52], [26, 66], [70, 64], [52, 78], [38, 40]].map(([x, y], i) => (
                    <span key={i} className="absolute h-1 w-1 rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%` }} />
                  ))}
                  <Star className="h-4 w-4 fill-white text-white" />
                </span>
              }
            />
            <MagicCard
              onClick={() => addSmart("moon")}
              title="Moon phase"
              text="How the moon looked on that night."
              art={
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1f2747]">
                  <Moon className="h-6 w-6 fill-[#f4ecd8] text-[#f4ecd8]" />
                </span>
              }
            />
            <MagicCard
              onClick={() => addSmart("qr")}
              title="QR code"
              text="Link a voice note, video or song — they scan it to play."
              art={<QrCode className="h-9 w-9 text-navy" strokeWidth={1.5} />}
            />
            <MagicCard
              onClick={() => addSmart("curved")}
              title="Curved text"
              text="Words that bend in an arch — great around photos."
              art={<Spline className="h-8 w-8 text-gold-dark" strokeWidth={1.6} />}
            />
            <div className="grid grid-cols-2 gap-2">
              <ShapeButton icon={Heart} label="Heart photo" onClick={() => addSmart("heartPhoto")} />
              <ShapeButton icon={CircleUser} label="Round photo" onClick={() => addSmart("circlePhoto")} />
            </div>
          </div>
        ) : null}

        {tab === "shapes" ? (
          <div className="grid grid-cols-2 gap-2">
            <ShapeButton icon={Frame} label="Photo frame" onClick={() => addShape("photo")} />
            <ShapeButton icon={Square} label="Square" onClick={() => addShape("rect")} />
            <ShapeButton icon={RectangleHorizontal} label="Rounded" onClick={() => addShape("rounded")} />
            <ShapeButton icon={Circle} label="Circle" onClick={() => addShape("circle")} />
            <ShapeButton icon={Minus} label="Line / shelf" onClick={() => addShape("line")} />
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

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold tracking-wide text-navy uppercase">Textures &amp; patterns</h3>
                  {doc.background.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => onBackground({ imageUrl: null })}
                      className="text-xs font-medium text-error hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <BackgroundsGallery current={doc.background.imageUrl} onPick={(src) => onBackground({ imageUrl: src })} />
              </div>

              {mode === "admin" ? (
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <h3 className="text-xs font-semibold tracking-wide text-navy uppercase">Your own image</h3>
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

function MagicCard({ title, text, art, onClick }: { title: string; text: string; art: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-paper p-2.5 text-left transition hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_8px_18px_-12px_rgba(30,42,74,0.45)] active:scale-[0.98]"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-dark">{art}</span>
      <span className="min-w-0">
        <span className="block font-display text-[15px] text-navy">{title}</span>
        <span className="block text-xs leading-snug text-muted">{text}</span>
      </span>
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
