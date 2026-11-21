"use client";

/* eslint-disable @next/next/no-img-element -- layered transparent artwork that animates between arrangements */

import { useEffect, useRef, useState } from "react";
import type { DesignDoc } from "@/lib/studio/doc";
import { STUDIO_FONTS } from "@/components/studio/fonts";
import { cn } from "@/lib/utils";

/**
 * Lightweight HTML render of a bouquet design. Every piece keeps a stable id,
 * so when the recipe changes the flowers glide to their new places.
 */
export function BouquetPreview({ doc, className }: { doc: DesignDoc; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setScale(Math.min(width / doc.width, height / doc.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc.width, doc.height]);

  return (
    <div ref={boxRef} className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      {scale > 0 ? (
        <div className="relative shrink-0" style={{ width: doc.width * scale, height: doc.height * scale }}>
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: doc.width, height: doc.height, transform: `scale(${scale})` }}>
            {doc.nodes.map((node) => {
              const frame: React.CSSProperties = {
                position: "absolute",
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                transform: `rotate(${node.rotation}deg)`,
                transformOrigin: "0 0",
                opacity: node.opacity,
                transition: "left 0.5s cubic-bezier(0.2,0.8,0.2,1), top 0.5s cubic-bezier(0.2,0.8,0.2,1), width 0.5s ease, height 0.5s ease, transform 0.5s ease, opacity 0.3s",
              };
              if (node.type === "image") {
                return (
                  <div key={node.id} style={frame} className="pp-rise">
                    <img
                      src={node.src}
                      alt=""
                      draggable={false}
                      className="h-full w-full select-none"
                      style={{ transform: node.flipX ? "scaleX(-1)" : undefined }}
                    />
                  </div>
                );
              }
              if (node.type === "text") {
                return (
                  <div
                    key={node.id}
                    style={{
                      ...frame,
                      fontFamily: STUDIO_FONTS[node.fontFamily]?.family,
                      fontSize: node.fontSize,
                      lineHeight: node.lineHeight,
                      color: node.fill,
                      textAlign: node.align,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {node.text}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
