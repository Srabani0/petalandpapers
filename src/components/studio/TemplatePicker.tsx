"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { detectShelves, type DesignDoc, type StudioKind } from "@/lib/studio/doc";
import type { Scene3D } from "@/components/studio/three/scene";

const StaticDesignPreview = dynamic(
  () => import("@/components/studio/StaticDesignPreview").then((m) => m.StaticDesignPreview),
  { ssr: false, loading: () => <Loader2 className="h-5 w-5 animate-spin text-muted" /> },
);
const Preview3DModal = dynamic(
  () => import("@/components/studio/three/Preview3DModal").then((m) => m.Preview3DModal),
  { ssr: false },
);

export interface PickerTemplate {
  id: string;
  name: string;
  sizeLabel: string;
  width: number;
  height: number;
  price: number;
  thumbnailUrl: string | null;
  doc: DesignDoc | null;
}

interface DesignGroup {
  name: string;
  sizes: PickerTemplate[];
}

/**
 * Templates grouped into "designs" (same name), each offering its sizes as
 * chips. Customers can spin a 3D preview before starting to customize.
 */
export function TemplatePicker({
  templates,
  kind,
  signedIn,
  returnTo,
}: {
  templates: PickerTemplate[];
  kind: StudioKind;
  signedIn: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const groups = useMemo<DesignGroup[]>(() => {
    const map = new Map<string, PickerTemplate[]>();
    for (const t of templates) map.set(t.name, [...(map.get(t.name) ?? []), t]);
    return [...map.entries()].map(([name, sizes]) => ({ name, sizes: sizes.sort((a, b) => a.price - b.price) }));
  }, [templates]);

  const allSizes = useMemo(() => [...new Set(templates.map((t) => t.sizeLabel))], [templates]);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [snapshots, setSnapshots] = useState<Record<string, Scene3D>>({});
  const [viewing, setViewing] = useState<PickerTemplate | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; text: string } | null>(null);

  const remember = useCallback((id: string, scene: Scene3D) => {
    setSnapshots((s) => (s[id] ? s : { ...s, [id]: scene }));
  }, []);

  const visible = sizeFilter ? groups.filter((g) => g.sizes.some((s) => s.sizeLabel === sizeFilter)) : groups;

  async function start(template: PickerTemplate) {
    if (!signedIn) {
      router.push(`/login?from=${encodeURIComponent(returnTo)}`);
      return;
    }
    setStarting(template.id);
    setError(null);
    try {
      const res = await fetch("/api/studio/designs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/login?from=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!res.ok) {
        setError({ id: template.id, text: data.error ?? "Couldn't start your design." });
        return;
      }
      router.push(`/studio/design/${data.id}`);
    } catch {
      setError({ id: template.id, text: "Couldn't reach the server. Please try again." });
    } finally {
      setStarting(null);
    }
  }

  return (
    <>
      {allSizes.length > 1 ? (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-muted">Size:</span>
          <Chip active={sizeFilter === null} onClick={() => setSizeFilter(null)}>
            All sizes
          </Chip>
          {allSizes.map((s) => (
            <Chip key={s} active={sizeFilter === s} onClick={() => setSizeFilter(s)}>
              {s}
            </Chip>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((group) => {
          const pick =
            group.sizes.find((s) => s.id === chosen[group.name]) ??
            (sizeFilter ? group.sizes.find((s) => s.sizeLabel === sizeFilter) : undefined) ??
            group.sizes[0];
          return (
            <article key={group.name} className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper">
              <div className="relative aspect-[4/3] bg-[#ebe7df]">
                {pick.thumbnailUrl ? (
                  <Image
                    src={pick.thumbnailUrl}
                    alt={`${group.name} – ${pick.sizeLabel}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4"
                  />
                ) : pick.doc ? (
                  <StaticDesignPreview
                    key={pick.id}
                    doc={pick.doc}
                    kind={kind}
                    className="absolute inset-0 p-4"
                    onSnapshot={(scene) => remember(pick.id, scene)}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setViewing(pick)}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm backdrop-blur transition hover:bg-white"
                >
                  <Box className="h-3.5 w-3.5 text-gold-dark" /> 3D preview
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <h2 className="font-display text-lg text-navy">{group.name}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {group.sizes.map((s) => (
                    <Chip
                      key={s.id}
                      small
                      active={s.id === pick.id}
                      onClick={() => setChosen((c) => ({ ...c, [group.name]: s.id }))}
                    >
                      {s.sizeLabel}
                    </Chip>
                  ))}
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                  <p className="font-display text-2xl text-navy">₹{pick.price.toFixed(0)}</p>
                  <Button size="sm" onClick={() => start(pick)} disabled={starting !== null}>
                    {starting === pick.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {starting === pick.id ? "Opening…" : "Customize"}
                  </Button>
                </div>
                {error?.id === pick.id ? <p className="text-sm text-error">{error.text}</p> : null}
              </div>
            </article>
          );
        })}
      </div>

      {viewing && viewing.doc && !snapshots[viewing.id] ? (
        // Off-screen render to build the 3D scene for templates shown as an uploaded thumbnail.
        <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 h-[600px] w-[600px]">
          <StaticDesignPreview doc={viewing.doc} kind={kind} className="h-full w-full" onSnapshot={(scene) => remember(viewing.id, scene)} />
        </div>
      ) : null}

      {viewing ? (
        <Preview3DModal
          open
          onClose={() => setViewing(null)}
          title={`${viewing.name} · ${viewing.sizeLabel}`}
          subtitle="Template preview — you'll add your own photos, names and colours in the editor."
          kind={kind}
          textureUrl={snapshots[viewing.id]?.texture ?? (kind === "MINIATURE" ? null : viewing.thumbnailUrl)}
          aspect={viewing.width / viewing.height}
          shelves={snapshots[viewing.id]?.shelves ?? (kind === "MINIATURE" && viewing.doc ? detectShelves(viewing.doc) : [])}
          items={snapshots[viewing.id]?.items}
          footer={
            <Button onClick={() => start(viewing)} disabled={starting !== null}>
              <Wand2 className="h-4 w-4" /> Customize this · ₹{viewing.price.toFixed(0)}
            </Button>
          }
        />
      ) : null}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border transition-colors",
        small ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
        active ? "border-navy bg-navy text-cream" : "border-border bg-paper text-navy hover:border-gold",
      )}
    >
      {children}
    </button>
  );
}
