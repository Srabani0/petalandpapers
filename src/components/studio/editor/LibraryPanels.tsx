"use client";

/* eslint-disable @next/next/no-img-element -- hundreds of tiny static thumbnails; plain lazy <img> is lighter than next/image here */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, X, Check, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DRAG_MIME, type DropPayload } from "@/components/studio/editor/CanvasStage";
import {
  pushRecent,
  readRecent,
  searchItems,
  useLibrary,
  type LibraryItem,
  type RecentSticker,
} from "@/components/studio/editor/library";

export interface CategorySticker {
  id: string;
  name: string;
  group: string;
  imageUrl: string;
}

const PAGE = 48;
/** Two rows of previews per section: 4-up on phones, 6-up on tablets, 3-up in the desktop side panel. */
const PREVIEW_GRID =
  "grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-3 [&>*:nth-child(n+9)]:hidden sm:[&>*:nth-child(n+9)]:flex lg:[&>*:nth-child(n+7)]:hidden";

function dragProps(payload: DropPayload, onUse?: () => void) {
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "copy";
      onUse?.();
    },
  };
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-white py-2 pr-9 pl-9 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-muted focus:border-gold focus:ring-2 focus:ring-gold/25 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted hover:bg-cream-dark hover:text-navy"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function Chips({ items, value, onChange }: { items: string[]; value: string | null; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: 1 | -1) => ref.current?.scrollBy({ left: d * 160, behavior: "smooth" });
  return (
    <div className="relative -mx-1">
      <div
        ref={ref}
        className="flex gap-1.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[null, ...items].map((g) => (
          <button
            key={g ?? "all"}
            type="button"
            onClick={() => onChange(g)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
              value === g ? "border-navy bg-navy text-cream" : "border-border bg-white text-navy hover:border-gold",
            )}
          >
            {g ? g.replace(/^Words · /, "Words: ") : "All"}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => scroll(-1)} aria-label="Scroll left" className="absolute top-0 -left-1 hidden h-6 w-6 items-center justify-center rounded-full bg-white/95 text-navy shadow lg:flex">
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => scroll(1)} aria-label="Scroll right" className="absolute top-0 -right-1 hidden h-6 w-6 items-center justify-center rounded-full bg-white/95 text-navy shadow lg:flex">
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Grid that reveals more items as the sentinel scrolls into view. */
function InfiniteGrid<T>({
  items,
  render,
  cols = 3,
  resetKey,
}: {
  items: T[];
  render: (item: T) => React.ReactNode;
  cols?: 2 | 3;
  resetKey: string;
}) {
  const [shownState, setShownState] = useState({ key: resetKey, count: PAGE });
  const shown = shownState.key === resetKey ? shownState.count : PAGE;
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShownState((s) => ({ key: resetKey, count: (s.key === resetKey ? s.count : PAGE) + PAGE }));
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [resetKey, items.length]);

  return (
    <>
      <div className={cn("grid gap-2", cols === 3 ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-3" : "grid-cols-2")}>{items.slice(0, shown).map(render)}</div>
      {shown < items.length ? <div ref={sentinel} className="h-8" /> : null}
    </>
  );
}

function StickerTile({ thumb, name, onClick, drag }: { thumb: string; name: string; onClick: () => void; drag: ReturnType<typeof dragProps> }) {
  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      {...drag}
      className="group/tile relative flex aspect-square items-center justify-center rounded-xl bg-[#faf7f2] p-1.5 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_18px_-10px_rgba(30,42,74,0.45)] hover:ring-1 hover:ring-gold/50 active:scale-95"
    >
      <img src={thumb} alt={name} loading="lazy" decoding="async" draggable={false} className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/tile:scale-105" />
    </button>
  );
}

function SectionHeader({ title, onAll, icon }: { title: string; onAll?: () => void; icon?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-navy uppercase">
        {icon}
        {title.replace(/^Words · /, "Words · ")}
      </h3>
      {onAll ? (
        <button type="button" onClick={onAll} className="text-xs font-medium text-gold-dark hover:underline">
          See all
        </button>
      ) : null}
    </div>
  );
}

// ─── Stickers ─────────────────────────────────────────────────────────────

export function StickersPanel({
  categoryStickers,
  onAdd,
}: {
  categoryStickers: CategorySticker[];
  onAdd: (src: string) => void;
}) {
  const library = useLibrary();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentSticker[]>(() => (typeof window === "undefined" ? [] : readRecent()));
  const OWN = "For this design";

  const remember = (item: RecentSticker) => setRecent(pushRecent(item));
  const add = (item: RecentSticker) => {
    remember(item);
    onAdd(item.src);
  };

  const ownAsItems: LibraryItem[] = useMemo(
    () =>
      categoryStickers.map((s) => ({
        id: s.id,
        name: s.name,
        group: OWN,
        tags: [s.group.toLowerCase()],
        src: s.imageUrl,
        thumb: s.imageUrl,
        w: 0,
        h: 0,
      })),
    [categoryStickers],
  );
  const all = useMemo(() => [...ownAsItems, ...(library?.stickers ?? [])], [ownAsItems, library]);
  const groups = useMemo(() => [...(ownAsItems.length ? [OWN] : []), ...(library?.stickerGroups ?? [])], [ownAsItems, library]);
  const browsing = !query && !group;
  const results = useMemo(() => (browsing ? [] : searchItems(all, query, group)), [all, query, group, browsing]);

  const tile = (item: LibraryItem) => (
    <StickerTile
      key={item.id}
      thumb={item.thumb}
      name={item.name}
      onClick={() => add({ src: item.src, thumb: item.thumb, name: item.name })}
      drag={dragProps({ kind: "image", src: item.src }, () => remember({ src: item.src, thumb: item.thumb, name: item.name }))}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-0 z-10 -mx-3 -mt-3 flex flex-col gap-2 bg-paper/95 px-3 pt-3 pb-2 backdrop-blur">
        <SearchBox value={query} onChange={setQuery} placeholder={`Search ${all.length ? `${all.length} ` : ""}stickers…`} />
        <Chips items={groups} value={group} onChange={setGroup} />
      </div>

      {!library ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading stickers…
        </div>
      ) : browsing ? (
        <div className="flex flex-col gap-5">
          {recent.length > 0 ? (
            <section>
              <SectionHeader title="Recently used" icon={<Clock className="h-3.5 w-3.5 text-gold-dark" />} />
              <div className="pp-no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
                {recent.map((r) => (
                  <div key={r.src} className="w-[72px] shrink-0">
                    <StickerTile thumb={r.thumb} name={r.name} onClick={() => add(r)} drag={dragProps({ kind: "image", src: r.src }, () => remember(r))} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {ownAsItems.length > 0 ? (
            <section>
              <SectionHeader title={OWN} icon={<Sparkles className="h-3.5 w-3.5 text-gold-dark" />} onAll={ownAsItems.length > 6 ? () => setGroup(OWN) : undefined} />
              <div className={PREVIEW_GRID}>{ownAsItems.slice(0, 12).map(tile)}</div>
            </section>
          ) : null}
          {library.stickerGroups.map((g) => {
            const items = library.stickers.filter((s) => s.group === g);
            return (
              <section key={g}>
                <SectionHeader title={g} onAll={() => setGroup(g)} />
                <div className={PREVIEW_GRID}>{items.slice(0, 12).map(tile)}</div>
              </section>
            );
          })}
        </div>
      ) : results.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No stickers match &ldquo;{query}&rdquo;. Try &ldquo;heart&rdquo;, &ldquo;birthday&rdquo; or &ldquo;flower&rdquo;.</p>
      ) : (
        <>
          <p className="text-xs text-muted">
            {results.length} sticker{results.length === 1 ? "" : "s"} · click or drag onto your design
          </p>
          <InfiniteGrid items={results} render={tile} resetKey={`${query}|${group}`} />
        </>
      )}
    </div>
  );
}

// ─── Backgrounds ──────────────────────────────────────────────────────────

export function BackgroundsGallery({ current, onPick }: { current: string | null; onPick: (src: string) => void }) {
  const library = useLibrary();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const results = useMemo(() => (library ? searchItems(library.backgrounds, query, group) : []), [library, query, group]);

  return (
    <div className="flex flex-col gap-3">
      <SearchBox value={query} onChange={setQuery} placeholder={`Search ${library?.backgrounds.length ?? ""} textures…`} />
      {library ? <Chips items={library.backgroundGroups} value={group} onChange={setGroup} /> : null}
      {!library ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading backgrounds…
        </div>
      ) : results.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No backgrounds match that search.</p>
      ) : (
        <InfiniteGrid
          items={results}
          cols={3}
          resetKey={`${query}|${group}`}
          render={(bg) => {
            const active = current === bg.src;
            return (
              <button
                key={bg.id}
                type="button"
                title={bg.name}
                onClick={() => onPick(bg.src)}
                className={cn(
                  "group/bg relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(30,42,74,0.5)]",
                  active && "ring-2 ring-gold ring-offset-2",
                )}
              >
                <img src={bg.thumb} alt={bg.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover/bg:scale-110" />
                {active ? (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-cream shadow">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </button>
            );
          }}
        />
      )}
    </div>
  );
}
