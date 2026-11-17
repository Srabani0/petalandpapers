"use client";

/* eslint-disable @next/next/no-img-element -- remote Pixabay previews in a scrolling grid; next/image would proxy every one */

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBox } from "@/components/studio/editor/LibraryPanels";

type Kind = "cutout" | "photo" | "illustration";

interface StockImage {
  id: number;
  thumb: string;
  width: number;
  height: number;
  tags: string;
  author: string;
  pageUrl: string;
}

const KINDS: { key: Kind; label: string; hint: string }[] = [
  { key: "cutout", label: "Cut-outs", hint: "Transparent images that sit on your design like stickers" },
  { key: "photo", label: "Photos", hint: "Real photos" },
  { key: "illustration", label: "Illustrations", hint: "Drawn and painted art" },
];

const IDEAS = ["roses", "flowers", "teddy bear", "balloons", "cake", "gift box", "butterfly", "heart", "coffee", "books", "graduation", "diya", "rakhi", "christmas", "crown", "puppy"];

let probe: Promise<boolean> | null = null;
/** Whether the server has a Pixabay key — checked once per page load. */
export function stockAvailable(): Promise<boolean> {
  if (!probe) {
    probe = fetch("/api/studio/stock?probe=1")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => Boolean(d.enabled))
      .catch(() => false);
  }
  return probe;
}

export function useStockAvailable() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let alive = true;
    stockAvailable().then((v) => alive && setEnabled(v));
    return () => {
      alive = false;
    };
  }, []);
  return enabled;
}

interface Results {
  key: string;
  page: number;
  items: StockImage[];
  total: number;
  error: string | null;
}

export function StockPanel({ onAdd }: { onAdd: (src: string) => Promise<void> | void }) {
  const [kind, setKind] = useState<Kind>("cutout");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const key = `${kind}|${debounced}`;
  const [pageState, setPageState] = useState({ key, page: 1 });
  const page = pageState.key === key ? pageState.page : 1;
  const [data, setData] = useState<Results>({ key: "", page: 0, items: [], total: 0, error: null });
  const [adding, setAdding] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ kind, q: debounced, page: String(page) });
    fetch(`/api/studio/stock?${params}`, { signal: ctrl.signal })
      .then(async (r) => {
        const body = (await r.json().catch(() => ({}))) as { items?: StockImage[]; total?: number; error?: string };
        if (!r.ok) throw new Error(body.error ?? "Image search is unavailable right now.");
        setData((prev) => ({
          key,
          page,
          items: page > 1 && prev.key === key ? [...prev.items, ...(body.items ?? [])] : (body.items ?? []),
          total: body.total ?? 0,
          error: null,
        }));
      })
      .catch((err: Error) => {
        if (ctrl.signal.aborted) return;
        setData((prev) => ({ ...prev, key, page, items: page > 1 && prev.key === key ? prev.items : [], error: err.message }));
      });
    return () => ctrl.abort();
  }, [key, kind, debounced, page]);

  const loading = data.key !== key || data.page !== page;
  const items = data.key === key ? data.items : [];

  const use = async (img: StockImage) => {
    if (adding) return;
    setAdding(img.id);
    setAddError(null);
    try {
      const res = await fetch("/api/studio/stock/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) throw new Error(body.error ?? "Couldn't add that image.");
      await onAdd(body.url);
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-0 z-10 -mx-3 -mt-3 flex flex-col gap-2 bg-paper/95 px-3 pt-3 pb-2 backdrop-blur">
        <SearchBox value={query} onChange={setQuery} placeholder="Search millions of free images…" />
        <div className="grid grid-cols-3 gap-1 rounded-full bg-cream-dark p-1">
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              title={k.hint}
              onClick={() => setKind(k.key)}
              className={cn(
                "rounded-full px-2 py-1 text-xs font-medium transition-colors",
                kind === k.key ? "bg-white text-navy shadow-sm" : "text-navy/70 hover:text-navy",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        {!query ? (
          <div className="flex flex-wrap gap-1.5">
            {IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setQuery(idea)}
                className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] text-navy hover:border-gold"
              >
                {idea}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {addError ? <p className="rounded-md bg-error/10 px-3 py-2 text-xs text-error">{addError}</p> : null}

      {data.error && data.key === key && items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{data.error}</p>
      ) : loading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding images…
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No images found. Try a simpler word like &ldquo;rose&rdquo; or &ldquo;gift&rdquo;.</p>
      ) : (
        <>
          <div className="columns-2 gap-2 [&>*]:mb-2">
            {items.map((img) => (
              <button
                key={img.id}
                type="button"
                title={`${img.tags} · by ${img.author}`}
                onClick={() => use(img)}
                disabled={adding !== null}
                className={cn(
                  "group/stock relative block w-full break-inside-avoid overflow-hidden rounded-xl ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(30,42,74,0.5)] disabled:cursor-wait",
                  kind === "cutout" ? "bg-[repeating-conic-gradient(#f3efe8_0_25%,#faf7f2_0_50%)] bg-[length:16px_16px] p-2" : "bg-cream-dark",
                )}
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
              >
                <img
                  src={img.thumb}
                  alt={img.tags}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className={cn("h-full w-full", kind === "cutout" ? "object-contain" : "object-cover")}
                />
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-navy/0 transition-colors group-hover/stock:bg-navy/25",
                    adding === img.id && "bg-navy/35",
                  )}
                >
                  {adding === img.id ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Plus className="h-6 w-6 text-white opacity-0 drop-shadow transition-opacity group-hover/stock:opacity-100" />
                  )}
                </span>
              </button>
            ))}
          </div>
          {items.length < data.total && page < 10 ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => setPageState({ key, page: page + 1 })}
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-white py-2 text-sm text-navy hover:border-gold disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Load more
            </button>
          ) : null}
        </>
      )}

      <p className="pt-1 text-center text-[11px] text-muted">
        Free images from{" "}
        <a href="https://pixabay.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-navy">
          Pixabay
        </a>
        . Click an image to add it to your design.
      </p>
    </div>
  );
}
