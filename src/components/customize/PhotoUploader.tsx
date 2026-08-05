"use client";

import { useEffect, useMemo, useRef } from "react";
import { Upload, X } from "lucide-react";

export function PhotoUploader({
  files,
  onChange,
  max,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    onChange([...files, ...picked].slice(0, max));
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-wrap gap-3">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-cream-dark"
        >
          {previewUrls[index] ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a Next-optimized asset
            <img src={previewUrls[index]} alt="" className="h-full w-full object-cover" />
          ) : null}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            aria-label="Remove photo"
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy/80 text-cream"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {files.length < max && (
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted hover:border-gold/40 hover:text-gold-dark">
          <Upload className="h-4 w-4" />
          <span className="text-[11px]">Add</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdd}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
