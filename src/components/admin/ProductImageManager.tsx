"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProductImageItem {
  id: string;
  url: string;
  isPrimary: boolean;
}

export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageItem[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Remove this image?")) return;
    setDeletingId(imageId);
    try {
      await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
            {image.isPrimary && (
              <Badge variant="gold" className="absolute top-1.5 left-1.5">
                Primary
              </Badge>
            )}
            <button
              type="button"
              onClick={() => handleDelete(image.id)}
              disabled={deletingId === image.id}
              className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-navy/80 text-cream opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              aria-label="Remove image"
            >
              {deletingId === image.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted hover:border-gold/40 hover:text-gold-dark">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
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

      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
    </div>
  );
}
