"use client";

import { useEffect, useState } from "react";

/**
 * Shared image loader for the canvas. Every image is loaded with
 * crossOrigin="anonymous" so the canvas stays exportable (Cloudinary sends
 * CORS headers; app assets are same-origin). Cached by URL so the same
 * sticker used ten times downloads once, and export can await them all.
 */
const cache = new Map<string, Promise<HTMLImageElement>>();
const ready = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  let pending = cache.get(src);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        ready.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        cache.delete(src);
        reject(new Error(`Couldn't load image ${src}`));
      };
      img.src = src;
    });
    cache.set(src, pending);
  }
  return pending;
}

export function useLoadedImage(src: string | null | undefined) {
  const [loaded, setLoaded] = useState<{ src: string; img: HTMLImageElement | null; failed: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (!src || ready.has(src)) return;
    let alive = true;
    loadImage(src)
      .then((img) => alive && setLoaded({ src, img, failed: false }))
      .catch(() => alive && setLoaded({ src, img: null, failed: true }));
    return () => {
      alive = false;
    };
  }, [src]);

  if (!src) return { image: null, failed: false };
  const cached = ready.get(src);
  if (cached) return { image: cached, failed: false };
  if (loaded?.src === src) return { image: loaded.img, failed: loaded.failed };
  return { image: null, failed: false };
}

export async function imageNaturalSize(src: string) {
  const img = await loadImage(src);
  return { width: img.naturalWidth || 400, height: img.naturalHeight || 400 };
}
