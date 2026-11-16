"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Creates the customer's own copy of a template, then opens it in the editor. */
export function StartDesignButton({
  templateId,
  signedIn,
  returnTo,
  className,
}: {
  templateId: string;
  signedIn: boolean;
  returnTo: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!signedIn) {
      router.push(`/login?from=${encodeURIComponent(returnTo)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/designs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/login?from=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Couldn't start your design. Please try again.");
        return;
      }
      router.push(`/studio/design/${data.id}`);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button type="button" onClick={start} disabled={busy} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {busy ? "Opening editor…" : "Customize this"}
      </Button>
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
    </div>
  );
}
