"use client";

import { useState } from "react";

const BODY_W = 200;
const BODY_H = 220;

/**
 * Lightweight mug preview: the flat print-area render is wrapped onto a mug
 * body showing the slice of the wrap that faces the viewer, with cylinder
 * shading on top. The slider "turns" the mug to see the rest of the wrap.
 */
export function MugMockup({ imageUrl, aspect }: { imageUrl: string | null; aspect: number }) {
  const [turn, setTurn] = useState(50);
  // Fraction of the wrap visible on the front face, so the slice keeps its
  // real proportions (no stretching).
  const visible = Math.min(1, Math.max(0.2, (BODY_W / BODY_H) / aspect));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: BODY_W + 70, height: BODY_H + 30 }}>
        {/* handle */}
        <div
          className="absolute rounded-r-[60px] border-[16px] border-l-0 border-[#f1f1f3] shadow-[inset_-2px_0_6px_rgba(0,0,0,0.12),2px_2px_8px_rgba(0,0,0,0.12)]"
          style={{ left: BODY_W - 12, top: 46, width: 70, height: 120 }}
        />
        {/* body */}
        <div
          className="absolute top-2 left-0 overflow-hidden rounded-t-[10px] rounded-b-[34px] bg-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
          style={{ width: BODY_W, height: BODY_H }}
        >
          {imageUrl ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${imageUrl}")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${100 / visible}% 100%`,
                backgroundPosition: `${turn}% 50%`,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">Preview…</div>
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.06) 14%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0) 46%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.3) 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-black/15 to-transparent" />
        </div>
      </div>
      <label className="flex w-full max-w-[240px] flex-col gap-1 text-xs text-muted">
        Turn the mug
        <input
          type="range"
          min={0}
          max={100}
          value={turn}
          onChange={(e) => setTurn(Number(e.target.value))}
          className="accent-gold"
        />
      </label>
    </div>
  );
}
