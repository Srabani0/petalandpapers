"use client";

import type { ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  FlipHorizontal,
  ImagePlus,
  Italic,
  Lock,
  Trash2,
  Underline,
  Unlock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FONT_KEYS,
  PHOTO_MASKS,
  type DesignNode,
  type MoonNode,
  type PhotoMask,
  type PhotoNode,
  type QrNode,
  type StarMapNode,
  type TextNode,
} from "@/lib/studio/doc";
import { PLACES, SvgPath, curvedTextPath, moonPhase, moonPhaseName, tracePhotoMask } from "@/lib/studio/smart";
import { STUDIO_FONTS } from "@/components/studio/fonts";

type Patch = (patch: Partial<DesignNode>, key?: string) => void;

export function PropertiesPanel({
  node,
  mode,
  emptySlots,
  onChange,
  onDelete,
  onDuplicate,
  onReorder,
  onReplacePhoto,
  onDeselect,
}: {
  node: DesignNode | null;
  mode: "admin" | "customer";
  emptySlots: number;
  onChange: Patch;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (to: 1 | -1 | "top" | "bottom") => void;
  onReplacePhoto: () => void;
  onDeselect: () => void;
}) {
  if (!node) {
    return (
      <div className="flex flex-col gap-3 p-4 text-sm text-muted">
        <p className="font-display text-base text-navy">Make it yours</p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>Click anything on the design to edit it.</li>
          <li>Drag to move, pull the corners to resize, use the round handle to rotate.</li>
          <li>Double-click text to type, or a photo frame to upload a picture.</li>
          <li>Ctrl + Z undoes, Delete removes the selected item.</li>
        </ul>
        {emptySlots > 0 ? (
          <p className="rounded-md bg-warning/10 px-3 py-2 text-warning">
            {emptySlots} photo frame{emptySlots === 1 ? "" : "s"} still empty.
          </p>
        ) : null}
      </div>
    );
  }

  const isLockedForCustomer = mode === "customer" && node.locked;
  const title = {
    image: "Image",
    photo: "Photo frame",
    text: "Text",
    rect: "Shape",
    ellipse: "Shape",
    qr: "QR code",
    starmap: "Star map",
    moon: "Moon phase",
  }[node.type];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-base text-navy">
          {title}
          {node.name ? <span className="ml-1.5 text-xs text-muted">· {node.name}</span> : null}
        </p>
        <button type="button" onClick={onDeselect} aria-label="Close" className="text-muted hover:text-navy">
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLockedForCustomer ? null : (
        <>
          {node.type === "text" ? <TextControls node={node} onChange={onChange} /> : null}
          {node.type === "photo" ? (
            <PhotoControls node={node} mode={mode} onChange={onChange} onReplacePhoto={onReplacePhoto} />
          ) : null}
          {node.type === "qr" ? <QrControls node={node} onChange={onChange} /> : null}
          {node.type === "starmap" ? <StarMapControls node={node} onChange={onChange} /> : null}
          {node.type === "moon" ? <MoonControls node={node} onChange={onChange} /> : null}
          {node.type === "image" ? (
            <IconToggle
              active={node.flipX}
              onClick={() => onChange({ flipX: !node.flipX })}
              icon={<FlipHorizontal className="h-4 w-4" />}
              label="Flip"
            />
          ) : null}
          {node.type === "rect" || node.type === "ellipse" ? (
            <>
              <ColorRow label="Fill" value={node.fill} onChange={(v) => onChange({ fill: v }, "fill")} />
              <ColorRow label="Border" value={node.stroke} onChange={(v) => onChange({ stroke: v }, "stroke")} />
              <Slider
                label="Border width"
                min={0}
                max={40}
                value={node.strokeWidth}
                onChange={(v) => onChange({ strokeWidth: v }, "strokeWidth")}
              />
              {node.type === "rect" ? (
                <Slider
                  label="Corner radius"
                  min={0}
                  max={Math.round(Math.min(node.width, node.height) / 2)}
                  value={node.cornerRadius}
                  onChange={(v) => onChange({ cornerRadius: v }, "cornerRadius")}
                />
              ) : null}
            </>
          ) : null}

          <Section title="Appearance">
            <Slider
              label="Transparency"
              min={0}
              max={100}
              value={Math.round((1 - node.opacity) * 100)}
              suffix="%"
              onChange={(v) => onChange({ opacity: 1 - v / 100 }, "opacity")}
            />
            <Slider
              label="Rotation"
              min={-180}
              max={180}
              value={Math.round(((node.rotation + 540) % 360) - 180)}
              suffix="°"
              onChange={(v) => onChange({ rotation: v }, "rotation")}
            />
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={node.shadow} onChange={(e) => onChange({ shadow: e.target.checked })} />
              Drop shadow
            </label>
          </Section>
        </>
      )}

      <Section title="Arrange">
        <div className="grid grid-cols-4 gap-1.5">
          <SmallButton label="Bring to front" onClick={() => onReorder("top")} disabled={isLockedForCustomer}>
            <ArrowUpToLine className="h-4 w-4" />
          </SmallButton>
          <SmallButton label="Forward" onClick={() => onReorder(1)} disabled={isLockedForCustomer}>
            <ChevronUp className="h-4 w-4" />
          </SmallButton>
          <SmallButton label="Backward" onClick={() => onReorder(-1)} disabled={isLockedForCustomer}>
            <ChevronDown className="h-4 w-4" />
          </SmallButton>
          <SmallButton label="Send to back" onClick={() => onReorder("bottom")} disabled={isLockedForCustomer}>
            <ArrowDownToLine className="h-4 w-4" />
          </SmallButton>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <SmallButton label="Duplicate" onClick={onDuplicate} wide disabled={isLockedForCustomer}>
            <Copy className="h-4 w-4" /> Duplicate
          </SmallButton>
          <SmallButton label="Delete" onClick={onDelete} wide danger disabled={isLockedForCustomer}>
            <Trash2 className="h-4 w-4" /> Delete
          </SmallButton>
        </div>
      </Section>

      {mode === "admin" ? (
        <Section title="Template settings">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Layer name (shown to you only)
            <input
              value={node.name ?? ""}
              maxLength={60}
              onChange={(e) => onChange({ name: e.target.value }, "name")}
              className="rounded-md border border-border bg-paper px-2.5 py-1.5 text-sm text-ink"
            />
          </label>
          <IconToggle
            active={node.locked}
            onClick={() => onChange({ locked: !node.locked })}
            icon={node.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            label={node.locked ? "Locked — part of the skeleton" : "Editable by customers"}
          />
          {node.locked ? (
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={Boolean(node.slideY)}
                onChange={(e) => onChange({ slideY: e.target.checked })}
              />
              Customers can slide it up / down (shelves)
            </label>
          ) : null}
        </Section>
      ) : isLockedForCustomer ? (
        <p className="flex items-start gap-2 text-sm text-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          {node.slideY
            ? "Drag it up or down (or use the ↑ ↓ keys) to move it. Everything else about it is fixed."
            : "This is part of the template and can't be changed."}
        </p>
      ) : null}
    </div>
  );
}

function TextControls({ node, onChange }: { node: TextNode; onChange: Patch }) {
  return (
    <>
      <textarea
        value={node.text}
        maxLength={500}
        rows={3}
        onChange={(e) => onChange({ text: e.target.value }, "text")}
        className="w-full resize-y rounded-md border border-border bg-paper px-2.5 py-2 text-sm text-ink focus:border-gold focus:outline-none"
      />
      <select
        value={node.fontFamily}
        onChange={(e) => onChange({ fontFamily: e.target.value as TextNode["fontFamily"] })}
        className="w-full rounded-md border border-border bg-paper px-2.5 py-2 text-sm"
        style={{ fontFamily: STUDIO_FONTS[node.fontFamily].family }}
      >
        {FONT_KEYS.map((key) => (
          <option key={key} value={key} style={{ fontFamily: STUDIO_FONTS[key].family }}>
            {STUDIO_FONTS[key].label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <NumberField
          label="Size"
          value={Math.round(node.fontSize)}
          min={4}
          max={800}
          onChange={(v) => onChange({ fontSize: v }, "fontSize")}
        />
        <input
          type="color"
          aria-label="Text colour"
          value={node.fill.slice(0, 7)}
          onChange={(e) => onChange({ fill: e.target.value }, "fill")}
          className="h-9 w-11 cursor-pointer rounded border border-border bg-transparent"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <IconToggle active={node.bold} onClick={() => onChange({ bold: !node.bold })} icon={<Bold className="h-4 w-4" />} />
        <IconToggle active={node.italic} onClick={() => onChange({ italic: !node.italic })} icon={<Italic className="h-4 w-4" />} />
        <IconToggle
          active={node.underline}
          onClick={() => onChange({ underline: !node.underline })}
          icon={<Underline className="h-4 w-4" />}
        />
        <span className="mx-1 w-px bg-border" />
        <IconToggle active={node.align === "left"} onClick={() => onChange({ align: "left" })} icon={<AlignLeft className="h-4 w-4" />} />
        <IconToggle
          active={node.align === "center"}
          onClick={() => onChange({ align: "center" })}
          icon={<AlignCenter className="h-4 w-4" />}
        />
        <IconToggle active={node.align === "right"} onClick={() => onChange({ align: "right" })} icon={<AlignRight className="h-4 w-4" />} />
      </div>
      <Section title="Curve">
        <Slider
          label="Bend into an arc"
          min={-100}
          max={100}
          value={Math.round(node.curve ?? 0)}
          onChange={(v) =>
            onChange(
              {
                curve: v,
                height: Math.round(
                  v ? curvedTextPath(node.width, node.fontSize, v).height : node.fontSize * node.lineHeight * Math.max(1, node.text.split("\n").length),
                ),
              },
              "curve",
            )
          }
        />
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Straight", v: 0 },
            { label: "Arch", v: 45 },
            { label: "Smile", v: -45 },
          ].map((o) => (
            <SmallButton
              key={o.label}
              label={o.label}
              wide
              onClick={() =>
                onChange({
                  curve: o.v,
                  height: Math.round(o.v ? curvedTextPath(node.width, node.fontSize, o.v).height : node.fontSize * node.lineHeight * 1.2),
                })
              }
            >
              {o.label}
            </SmallButton>
          ))}
        </div>
      </Section>
      <Section title="Spacing & outline">
        <Slider
          label="Line height"
          min={50}
          max={300}
          value={Math.round(node.lineHeight * 100)}
          suffix="%"
          onChange={(v) => onChange({ lineHeight: v / 100 }, "lineHeight")}
        />
        <Slider
          label="Letter spacing"
          min={-10}
          max={60}
          value={Math.round(node.letterSpacing)}
          onChange={(v) => onChange({ letterSpacing: v }, "letterSpacing")}
        />
        <ColorRow label="Outline" value={node.stroke} onChange={(v) => onChange({ stroke: v }, "stroke")} />
        <Slider
          label="Outline width"
          min={0}
          max={20}
          value={node.strokeWidth}
          onChange={(v) => onChange({ strokeWidth: v }, "strokeWidth")}
        />
      </Section>
    </>
  );
}

function PhotoControls({
  node,
  mode,
  onChange,
  onReplacePhoto,
}: {
  node: PhotoNode;
  mode: "admin" | "customer";
  onChange: Patch;
  onReplacePhoto: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onReplacePhoto}
          className="flex items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-cream hover:bg-gold-dark"
        >
          <ImagePlus className="h-4 w-4" />
          {node.src ? "Replace" : "Add photo"}
        </button>
        {node.src ? (
          <button
            type="button"
            onClick={() => onChange({ src: null, zoom: 1, panX: 0, panY: 0 })}
            className="rounded-md border border-border px-3 py-2 text-sm text-navy hover:border-error hover:text-error"
          >
            Remove photo
          </button>
        ) : null}
      </div>
      {node.src ? (
        <Section title="Position photo">
          <Slider
            label="Zoom"
            min={100}
            max={400}
            value={Math.round(node.zoom * 100)}
            suffix="%"
            onChange={(v) => onChange({ zoom: v / 100 }, "zoom")}
          />
          <Slider
            label="Left ↔ right"
            min={-100}
            max={100}
            value={Math.round(node.panX * 100)}
            onChange={(v) => onChange({ panX: v / 100 }, "panX")}
          />
          <Slider
            label="Up ↕ down"
            min={-100}
            max={100}
            value={Math.round(node.panY * 100)}
            onChange={(v) => onChange({ panY: v / 100 }, "panY")}
          />
        </Section>
      ) : null}
      <Section title="Shape">
        <div className="grid grid-cols-6 gap-1.5">
          {PHOTO_MASKS.map((mask) => (
            <button
              key={mask}
              type="button"
              title={MASK_LABEL[mask]}
              aria-label={MASK_LABEL[mask]}
              aria-pressed={(node.mask ?? "rect") === mask}
              onClick={() => onChange({ mask })}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border transition-colors",
                (node.mask ?? "rect") === mask ? "border-navy bg-navy text-cream" : "border-border text-navy hover:border-gold",
              )}
            >
              <MaskIcon mask={mask} />
            </button>
          ))}
        </div>
      </Section>
      <Section title="Frame">
        <ColorRow label="Frame colour" value={node.stroke} onChange={(v) => onChange({ stroke: v }, "stroke")} />
        <Slider
          label="Frame width"
          min={0}
          max={60}
          value={node.strokeWidth}
          onChange={(v) => onChange({ strokeWidth: v }, "strokeWidth")}
        />
        <ColorRow label="Mat colour" value={node.fill} onChange={(v) => onChange({ fill: v }, "fill")} />
        <Slider
          label="Mat size"
          min={0}
          max={Math.round(Math.min(node.width, node.height) / 4)}
          value={node.padding}
          onChange={(v) => onChange({ padding: v }, "padding")}
        />
        {(node.mask ?? "rect") === "rect" ? (
          <Slider
            label="Rounded corners"
            min={0}
            max={Math.round(Math.min(node.width, node.height) / 2)}
            value={node.cornerRadius}
            onChange={(v) => onChange({ cornerRadius: v }, "cornerRadius")}
          />
        ) : null}
      </Section>
      {mode === "admin" ? (
        <label className="flex flex-col gap-1 text-xs text-muted">
          Hint shown inside the empty frame
          <input
            value={node.placeholder}
            maxLength={40}
            onChange={(e) => onChange({ placeholder: e.target.value }, "placeholder")}
            className="rounded-md border border-border bg-paper px-2.5 py-1.5 text-sm text-ink"
          />
        </label>
      ) : null}
    </>
  );
}

const MASK_LABEL: Record<PhotoMask, string> = {
  rect: "Rectangle",
  circle: "Circle",
  heart: "Heart",
  star: "Star",
  arch: "Arch",
  hexagon: "Hexagon",
};

function MaskIcon({ mask }: { mask: PhotoMask }) {
  const path = new SvgPath();
  tracePhotoMask(path, mask, 3, 3, 18, 18, 4);
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d={path.d} fill="currentColor" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-paper px-2.5 py-2 text-sm text-ink focus:border-gold focus:outline-none";

function QrControls({ node, onChange }: { node: QrNode; onChange: Patch }) {
  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Link or text the QR code opens
        <textarea
          value={node.data}
          maxLength={500}
          rows={2}
          placeholder="Paste a link — YouTube video, voice note, Instagram, Google Maps…"
          onChange={(e) => onChange({ data: e.target.value || " " }, "data")}
          className={cn(inputClass, "resize-y")}
        />
      </label>
      <p className="text-xs text-muted">Tip: upload a voice message or video to Google Drive / YouTube and paste its share link here.</p>
      <ColorRow label="Code colour" value={node.fg} onChange={(v) => onChange({ fg: v }, "fg")} />
      <ColorRow label="Background" value={node.bg} onChange={(v) => onChange({ bg: v }, "bg")} />
    </>
  );
}

function StarMapControls({ node, onChange }: { node: StarMapNode; onChange: Patch }) {
  const known = PLACES.some((p) => p.name === node.place);
  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Date &amp; time (local)
        <input
          type="datetime-local"
          value={node.date}
          onChange={(e) => e.target.value && onChange({ date: e.target.value.slice(0, 16) }, "date")}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Place
        <select
          value={known ? node.place : ""}
          onChange={(e) => {
            const place = PLACES.find((p) => p.name === e.target.value);
            if (place) onChange({ place: place.name, lat: place.lat, lon: place.lon, utcOffset: place.tz });
          }}
          className={inputClass}
        >
          {!known ? <option value="">{node.place || "Custom location"}</option> : null}
          {PLACES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-muted">
        The real sky over {node.place || "this place"} at that moment — {Math.abs(node.lat).toFixed(2)}° {node.lat >= 0 ? "N" : "S"},{" "}
        {Math.abs(node.lon).toFixed(2)}° {node.lon >= 0 ? "E" : "W"}.
      </p>
      <ColorRow label="Sky" value={node.sky} onChange={(v) => onChange({ sky: v }, "sky")} />
      <ColorRow label="Stars" value={node.starColor} onChange={(v) => onChange({ starColor: v }, "starColor")} />
      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={node.lines} onChange={(e) => onChange({ lines: e.target.checked })} />
        Constellation lines
      </label>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={node.grid} onChange={(e) => onChange({ grid: e.target.checked })} />
        Sky grid
      </label>
    </>
  );
}

function MoonControls({ node, onChange }: { node: MoonNode; onChange: Patch }) {
  const { phase, illumination } = moonPhase(node.date, 330);
  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Date &amp; time
        <input
          type="datetime-local"
          value={node.date}
          onChange={(e) => e.target.value && onChange({ date: e.target.value.slice(0, 16) }, "date")}
          className={inputClass}
        />
      </label>
      <p className="rounded-md bg-cream-dark px-3 py-2 text-sm text-navy">
        {moonPhaseName(phase)} · {Math.round(illumination * 100)}% lit
      </p>
      <ColorRow label="Moon" value={node.lit} onChange={(v) => onChange({ lit: v }, "lit")} />
      <ColorRow label="Shadow" value={node.dark} onChange={(v) => onChange({ dark: v }, "dark")} />
    </>
  );
}

// ─── Small controls ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border pt-3">
      <p className="text-xs font-semibold tracking-wide text-navy uppercase">{title}</p>
      {children}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  suffix = "",
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      <span className="flex justify-between">
        {label}
        <span className="text-navy">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={Math.max(min + 1, max)}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-gold"
      />
    </label>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-navy">
      {label}
      <input
        type="color"
        value={value.slice(0, 7)}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-11 cursor-pointer rounded border border-border bg-transparent"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-1 items-center gap-2 text-xs text-muted">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="w-full rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink"
      />
    </label>
  );
}

function IconToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-9 items-center justify-center gap-2 rounded-md border px-2.5 text-sm transition-colors",
        active ? "border-navy bg-navy text-cream" : "border-border text-navy hover:border-gold",
        label ? "w-full justify-start" : "w-9",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SmallButton({
  label,
  onClick,
  children,
  wide,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  wide?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 items-center justify-center gap-1.5 rounded-md border border-border text-sm text-navy transition-colors disabled:opacity-40",
        danger ? "hover:border-error hover:text-error" : "hover:border-gold",
        wide ? "px-3" : "",
      )}
    >
      {children}
    </button>
  );
}
