"use client";

/* eslint-disable @next/next/no-img-element -- small library thumbnails */

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Input, Label, FieldError, FieldHint } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ElementRow {
  id: string;
  name: string;
  group: string;
  imageUrl: string;
}

export function ElementsManager({ categoryId, elements }: { categoryId: string; elements: ElementRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [group, setGroup] = useState("Stickers");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => [...new Set(elements.map((e) => e.group))], [elements]);
  const grouped = useMemo(() => {
    const map = new Map<string, ElementRow[]>();
    for (const el of elements) map.set(el.group, [...(map.get(el.group) ?? []), el]);
    return [...map.entries()];
  }, [elements]);

  async function upload(files: File[]) {
    setBusy(true);
    setError(null);
    try {
      // Upload in small batches to stay well under request-size limits.
      for (let i = 0; i < files.length; i += 4) {
        const body = new FormData();
        body.append("categoryId", categoryId);
        body.append("group", group);
        files.slice(i, i + 4).forEach((f) => body.append("files", f));
        const res = await fetch("/api/admin/studio/elements", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Upload failed.");
          break;
        }
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/admin/studio/elements/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="el-group">Group</Label>
          <Input
            id="el-group"
            list="el-groups"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Stickers, Props, Quotes…"
            maxLength={40}
          />
          <datalist id="el-groups">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/png,image/webp,image/jpeg,image/avif"
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) upload(files);
          }}
        />
        <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Uploading…" : "Upload elements"}
        </Button>
      </div>
      <FieldHint>
        Use transparent PNGs for stickers and props (clocks, trophies, plants, books, &ldquo;Best Teacher Ever&rdquo;
        badges…). Customers can drag them onto any design in this category.
      </FieldHint>
      <FieldError>{error ?? undefined}</FieldError>

      {grouped.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
          No elements yet.
        </p>
      ) : (
        grouped.map(([name, items]) => (
          <section key={name}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-navy uppercase">
              {name} <span className="font-normal text-muted">({items.length})</span>
            </h3>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
              {items.map((el) => (
                <div
                  key={el.id}
                  className="group relative flex aspect-square items-center justify-center rounded-md border border-border bg-[repeating-conic-gradient(#f4f1ea_0_25%,#fff_0_50%)] bg-[length:12px_12px] p-1.5"
                >
                  <img src={el.imageUrl} alt={el.name} title={el.name} className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => remove(el.id)}
                    disabled={deleting === el.id}
                    aria-label={`Remove ${el.name}`}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-paper text-error shadow sm:hidden sm:group-hover:flex"
                  >
                    {deleting === el.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
