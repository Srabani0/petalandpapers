"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, FieldHint } from "@/components/ui/Input";
import { SIZE_PRESETS, type DesignDoc, type StudioKind } from "@/lib/studio/doc";
import { DEFAULT_STARTER, STARTERS, buildStarter, type StarterKey } from "@/lib/studio/starters";
import type { StudioElement } from "@/components/studio/editor/Sidebar";
import type { EditorApi } from "@/components/studio/editor/DesignEditor";
import { describeExportError } from "@/components/studio/render";

const DesignEditor = dynamic(() => import("@/components/studio/editor/DesignEditor").then((m) => m.DesignEditor), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-2 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading editor…
    </div>
  ),
});

interface TemplateMeta {
  name: string;
  sizeLabel: string;
  width: number;
  height: number;
  price: string;
  isActive: boolean;
  sortOrder: number;
}

const selectClasses =
  "w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function AdminTemplateStudio({
  templateId,
  categoryId,
  categoryName,
  kind,
  elements,
  initialMeta,
  initialDoc,
}: {
  templateId: string | null;
  categoryId: string;
  categoryName: string;
  kind: StudioKind;
  elements: StudioElement[];
  initialMeta: TemplateMeta;
  initialDoc: DesignDoc | null;
}) {
  const router = useRouter();
  const [meta, setMeta] = useState(initialMeta);
  const [doc, setDoc] = useState<DesignDoc | null>(initialDoc);
  const [saving, setSaving] = useState(false);
  const backHref = `/admin/studio/${categoryId}`;

  if (!doc) {
    return (
      <SetupStep
        kind={kind}
        categoryName={categoryName}
        backHref={backHref}
        meta={meta}
        onStart={(nextMeta, starter) => {
          setMeta(nextMeta);
          setDoc(buildStarter(starter, nextMeta.width, nextMeta.height));
        }}
      />
    );
  }

  async function save(api: EditorApi) {
    const price = Number(meta.price);
    if (!meta.name.trim() || !meta.sizeLabel.trim() || !(price > 0)) {
      api.notify("error", "Fill in the template name, size label and a price above 0 (right-hand panel).");
      return;
    }
    setSaving(true);
    try {
      const { doc: current, revision } = api.snapshot();
      let thumbnail: Blob;
      try {
        thumbnail = await api.exportBlob({ maxSide: 800, mimeType: "image/jpeg", quality: 0.86 });
      } catch (err) {
        api.notify("error", describeExportError(err));
        return;
      }

      const body = new FormData();
      body.append(
        "meta",
        JSON.stringify({ ...meta, price, categoryId, name: meta.name.trim(), sizeLabel: meta.sizeLabel.trim() }),
      );
      body.append("canvas", JSON.stringify(current));
      body.append("thumbnail", new File([thumbnail], "thumbnail.jpg", { type: "image/jpeg" }));

      const res = await fetch(templateId ? `/api/admin/studio/templates/${templateId}` : "/api/admin/studio/templates", {
        method: templateId ? "PATCH" : "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        api.notify("error", data.error ?? "Couldn't save the template.");
        return;
      }
      api.markSaved(revision);
      api.notify("success", "Template saved.");
      if (!templateId) router.replace(`/admin/studio/templates/${data.template.id}`);
      else router.refresh();
    } catch {
      api.notify("error", "Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-paper">
      <DesignEditor
        mode="admin"
        initialDoc={doc}
        elements={elements}
        kind={kind}
        uploadEndpoint="/api/admin/studio/uploads"
        className="h-full"
        header={
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              aria-label="Back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-navy hover:bg-cream-dark"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate font-display text-base text-navy">{meta.name || "Untitled template"}</p>
              <p className="truncate text-xs text-muted">
                {categoryName} · {meta.sizeLabel} · {meta.width}×{meta.height}
              </p>
            </div>
          </div>
        }
        renderActions={(api) => (
          <Button size="sm" onClick={() => save(api)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="sm:hidden">{templateId ? (api.dirty ? "Save" : "Saved") : "Create"}</span>
            <span className="hidden sm:inline">{templateId ? (api.dirty ? "Save template" : "Saved") : "Create template"}</span>
          </Button>
        )}
        aside={
          <div className="flex flex-col gap-3 border-b border-border p-4">
            <p className="font-display text-base text-navy">Template details</p>
            <div>
              <Label htmlFor="t-name">Name</Label>
              <Input id="t-name" value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="t-size">Size label (shown to customers)</Label>
              <Input
                id="t-size"
                value={meta.sizeLabel}
                onChange={(e) => setMeta({ ...meta, sizeLabel: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="t-price">Price (₹)</Label>
                <Input
                  id="t-price"
                  type="number"
                  min={1}
                  step="0.01"
                  value={meta.price}
                  onChange={(e) => setMeta({ ...meta, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="t-sort">Sort order</Label>
                <Input
                  id="t-sort"
                  type="number"
                  min={0}
                  value={meta.sortOrder}
                  onChange={(e) => setMeta({ ...meta, sortOrder: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={meta.isActive}
                onChange={(e) => setMeta({ ...meta, isActive: e.target.checked })}
              />
              Active — customers can use it
            </label>
            <FieldHint>
              Lock the skeleton (background, shelves, easel) from the item&apos;s settings below. Unlocked photo
              frames, text and stickers stay editable for customers.
            </FieldHint>
          </div>
        }
      />
    </div>
  );
}

function SetupStep({
  kind,
  categoryName,
  backHref,
  meta,
  onStart,
}: {
  kind: StudioKind;
  categoryName: string;
  backHref: string;
  meta: TemplateMeta;
  onStart: (meta: TemplateMeta, starter: StarterKey) => void;
}) {
  const presets = SIZE_PRESETS.filter((p) => (kind === "MUG" ? p.key.startsWith("mug") : !p.key.startsWith("mug")));
  const [presetKey, setPresetKey] = useState<string>(presets[0]?.key ?? "custom");
  const [name, setName] = useState(meta.name);
  const [price, setPrice] = useState(meta.price);
  const [custom, setCustom] = useState({ width: 1000, height: 1200, label: "Custom size" });
  const [starter, setStarter] = useState<StarterKey>(DEFAULT_STARTER[kind]);
  const [error, setError] = useState<string | null>(null);

  function start() {
    const preset = presets.find((p) => p.key === presetKey);
    const width = preset ? preset.width : Math.round(custom.width);
    const height = preset ? preset.height : Math.round(custom.height);
    const sizeLabel = preset ? preset.label.split(" · ").pop() ?? preset.label : custom.label;
    if (!name.trim()) return setError("Give the template a name.");
    if (!(Number(price) > 0)) return setError("Enter a price above 0.");
    if (width < 200 || height < 200 || width > 6000 || height > 6000) {
      return setError("Custom size must be between 200 and 6000 pixels on each side.");
    }
    onStart({ ...meta, name: name.trim(), price, width, height, sizeLabel }, starter);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Back to {categoryName}
      </Link>
      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-border bg-paper p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
            <LayoutTemplate className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl text-navy">New {categoryName} template</h1>
            <p className="text-sm text-muted">Pick a size and a starting layout — you can change everything in the editor.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-name">Template name</Label>
            <Input id="n-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Teacher's Day Shelf" />
          </div>
          <div>
            <Label htmlFor="n-price">Price (₹)</Label>
            <Input id="n-price" type="number" min={1} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="n-size">Size</Label>
          <select id="n-size" value={presetKey} onChange={(e) => setPresetKey(e.target.value)} className={selectClasses}>
            {presets.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} ({p.width}×{p.height})
              </option>
            ))}
            <option value="custom">Custom…</option>
          </select>
          {presetKey === "custom" ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Input
                aria-label="Size label"
                value={custom.label}
                onChange={(e) => setCustom({ ...custom, label: e.target.value })}
                placeholder="e.g. 7 × 9 in"
              />
              <Input
                aria-label="Width (px)"
                type="number"
                value={custom.width}
                onChange={(e) => setCustom({ ...custom, width: Number(e.target.value) })}
              />
              <Input
                aria-label="Height (px)"
                type="number"
                value={custom.height}
                onChange={(e) => setCustom({ ...custom, height: Number(e.target.value) })}
              />
            </div>
          ) : null}
          <FieldHint>Only the proportions matter for the layout; print files are exported at high resolution.</FieldHint>
        </div>

        <div>
          <Label htmlFor="n-starter">Start from</Label>
          <select
            id="n-starter"
            value={starter}
            onChange={(e) => setStarter(e.target.value as StarterKey)}
            className={selectClasses}
          >
            {STARTERS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <FieldError>{error ?? undefined}</FieldError>
        <Button type="button" onClick={start} className="self-start">
          Open editor
        </Button>
      </div>
    </div>
  );
}
