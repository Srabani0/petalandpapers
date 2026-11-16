"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/templates/${templateId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {confirming ? (
        <span className="flex items-center gap-2 text-sm">
          <button type="button" onClick={remove} disabled={busy} className="font-medium text-error">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-navy">
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="Delete template"
          className="text-muted hover:text-error"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {error ? <span className="max-w-[220px] text-right text-xs text-error">{error}</span> : null}
    </div>
  );
}
