"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Label, FieldError } from "@/components/ui/Input";

export function SingleImageUpload({
  label,
  value,
  onChange,
  uploadEndpoint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadEndpoint: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-cream-dark">
          {value ? (
            <>
              <Image src={value} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove photo"
                className="absolute inset-0 flex items-center justify-center bg-navy/60 text-cream opacity-0 transition-opacity hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3.5 py-2.5 text-sm text-muted hover:border-gold/40 hover:text-gold-dark">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      <FieldError>{error ?? undefined}</FieldError>
    </div>
  );
}
