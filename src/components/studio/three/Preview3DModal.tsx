"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import type { StudioKind } from "@/lib/studio/doc";
import type { ShelfSpec, StandingItem3D } from "@/components/studio/three/scene";
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
  items,
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
  items?: StandingItem3D[];
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy-dark/60 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pp-rise flex h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[24px] bg-paper pb-[env(safe-area-inset-bottom)] shadow-2xl sm:h-full sm:max-h-[860px] sm:rounded-2xl sm:pb-0"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2 className="font-display text-lg text-navy sm:text-xl">{title}</h2>
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
          items={items}
          autoRotate
          className="min-h-0 flex-1 rounded-none"
        />
        {footer ? (
          <div className="flex flex-col-reverse items-stretch gap-2 border-t border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-5 sm:py-4 [&>*]:w-full sm:[&>*]:w-auto">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
