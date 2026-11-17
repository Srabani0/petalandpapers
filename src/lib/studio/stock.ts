/**
 * Stock images for the Design Studio, from Pixabay (free for commercial use,
 * including printed products, under the Pixabay Content License).
 *
 * Pixabay's API terms we follow here:
 *  - the API key stays on the server;
 *  - search responses are cached for 24 hours;
 *  - images are never permanently hot-linked: when a customer uses one it is
 *    copied into our own Cloudinary account first;
 *  - the UI shows "Images from Pixabay" wherever results appear.
 */
import { uploadImageFromUrl } from "@/lib/cloudinary";

export const STOCK_KINDS = ["cutout", "photo", "illustration"] as const;
export type StockKind = (typeof STOCK_KINDS)[number];

export interface StockImage {
  id: number;
  thumb: string;
  width: number;
  height: number;
  tags: string;
  author: string;
  pageUrl: string;
}

export interface StockPage {
  items: StockImage[];
  total: number;
}

interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
}

export const PER_PAGE = 30;
const DAY = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

export function stockEnabled() {
  return Boolean(process.env.PIXABAY_API_KEY);
}

async function pixabay(params: Record<string, string>): Promise<{ totalHits: number; hits: PixabayHit[] }> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) throw new Error("PIXABAY_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, safesearch: "true" });
  const cacheKey = qs.toString();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < DAY) return hit.data as { totalHits: number; hits: PixabayHit[] };

  qs.set("key", key);
  const res = await fetch(`https://pixabay.com/api/?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Pixabay ${res.status}`);
  const data = (await res.json()) as { totalHits: number; hits: PixabayHit[] };
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  cache.set(cacheKey, { at: Date.now(), data });
  return data;
}

/** Turns a free-text search into Pixabay params for the chosen kind. */
export function searchParams(query: string, kind: StockKind, page: number): Record<string, string> {
  const params: Record<string, string> = {
    q: query.trim().slice(0, 100),
    page: String(page),
    per_page: String(PER_PAGE),
    order: "popular",
  };
  if (kind === "photo") params.image_type = "photo";
  if (kind === "illustration") params.image_type = "illustration";
  if (kind === "cutout") {
    // Transparent PNGs — they sit on a design like real stickers.
    params.image_type = "all";
    params.colors = "transparent";
  }
  return params;
}

export async function searchStock(query: string, kind: StockKind, page: number): Promise<StockPage> {
  const data = await pixabay(searchParams(query, kind, page));
  return {
    total: data.totalHits,
    items: data.hits.map((h) => ({
      id: h.id,
      // _340 is Pixabay's mid-size preview — sharp enough for a 3-column grid.
      thumb: h.webformatURL.replace("_640", "_340"),
      width: h.imageWidth,
      height: h.imageHeight,
      tags: h.tags,
      author: h.user,
      pageUrl: h.pageURL,
    })),
  };
}

/**
 * Copies a Pixabay image into Cloudinary and returns our own URL. The image
 * is looked up by id on the server, so a client can't make us fetch an
 * arbitrary URL; a fixed public id means re-using an image doesn't upload it
 * twice.
 */
export async function importStock(id: number): Promise<{ url: string } | null> {
  const data = await pixabay({ id: String(id) });
  const hit = data.hits[0];
  if (!hit) return null;
  const source = new URL(hit.largeImageURL);
  if (source.protocol !== "https:" || !/(^|\.)pixabay\.com$/.test(source.hostname)) return null;
  const { url } = await uploadImageFromUrl(hit.largeImageURL, "designs/stock", { publicId: `pixabay-${hit.id}` });
  return { url };
}
