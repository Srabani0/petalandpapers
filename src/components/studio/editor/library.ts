"use client";

import { useEffect, useState } from "react";

/** One sticker or background from the generated library (public/studio/library). */
export interface LibraryItem {
  id: string;
  name: string;
  group: string;
  tags: string[];
  src: string;
  thumb: string;
  w: number;
  h: number;
}

export interface Library {
  stickers: LibraryItem[];
  backgrounds: LibraryItem[];
  stickerGroups: string[];
  backgroundGroups: string[];
}

const EMPTY: Library = { stickers: [], backgrounds: [], stickerGroups: [], backgroundGroups: [] };
let cached: Promise<Library> | null = null;

/** Fetched once per page load and shared by every panel. */
export function loadLibrary(): Promise<Library> {
  if (!cached) {
    cached = fetch("/studio/library/manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((m: { stickers: LibraryItem[]; backgrounds: LibraryItem[] }) => ({
        stickers: m.stickers,
        backgrounds: m.backgrounds,
        stickerGroups: [...new Set(m.stickers.map((s) => s.group))],
        backgroundGroups: [...new Set(m.backgrounds.map((s) => s.group))],
      }))
      .catch(() => {
        cached = null; // allow a retry next time
        return EMPTY;
      });
  }
  return cached;
}

export function useLibrary() {
  const [library, setLibrary] = useState<Library | null>(null);
  useEffect(() => {
    let alive = true;
    loadLibrary().then((l) => alive && setLibrary(l));
    return () => {
      alive = false;
    };
  }, []);
  return library;
}

/** Every search word must match the name, group or a tag. */
export function searchItems(items: LibraryItem[], query: string, group: string | null) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (group && item.group !== group) return false;
    if (words.length === 0) return true;
    const hay = `${item.name} ${item.group} ${item.tags.join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

// ─── Recently used (per browser; a convenience, never required) ────────────

const RECENT_KEY = "pp-studio-recent-stickers";
const RECENT_MAX = 18;

export interface RecentSticker {
  src: string;
  thumb: string;
  name: string;
}

export function readRecent(): RecentSticker[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as RecentSticker[]) : [];
    return Array.isArray(list) ? list.filter((r) => typeof r?.src === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecent(item: RecentSticker): RecentSticker[] {
  const next = [item, ...readRecent().filter((r) => r.src !== item.src)].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* private mode / storage full — recent list just won't persist */
  }
  return next;
}
