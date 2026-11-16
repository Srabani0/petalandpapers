"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteDesignButton({ designId }: { designId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/designs/${designId}`, { method: "DELETE" });
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

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <span className="text-muted">Delete?</span>
        <button type="button" onClick={remove} disabled={busy} className="font-medium text-error">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-navy">
          No
        </button>
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete design"
        className="text-muted hover:text-error"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </span>
  );
}
