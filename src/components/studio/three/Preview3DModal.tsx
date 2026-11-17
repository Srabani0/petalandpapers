"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import type { StudioKind } from "@/lib/studio/doc";
import type { ShelfSpec } from "@/components/studio/three/models";
import { Viewer3D } from "@/components/studio/three/Viewer3D";

export function Preview3DModal({
  open,
  onClose,
  title,
  subtitle,
  kind,
  textureUrl,
  aspect,
  shelves,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  kind: StudioKind;
  textureUrl: string | null;
  aspect: number;
  shelves: ShelfSpec[];
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-dark/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full max-h-[860px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-navy">{title}</h2>
            {subtitle ? <div className="mt-0.5 text-sm text-muted">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-cream-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Viewer3D
          kind={kind}
          textureUrl={textureUrl}
          aspect={aspect}
          shelves={shelves}
          autoRotate
          className="min-h-0 flex-1 rounded-none"
        />
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
