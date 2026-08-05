"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, FieldError } from "@/components/ui/Input";

export function DesignApproval({ customizationRequestId }: { customizationRequestId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "APPROVE" | "REQUEST_CHANGES") {
    if (decision === "REQUEST_CHANGES" && !showNotes) {
      setShowNotes(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/customizations/${customizationRequestId}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't submit your response.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      {showNotes ? (
        <div className="mb-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What would you like changed?"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" size="sm" onClick={() => submit("APPROVE")} disabled={busy}>
          Approve Design
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => submit("REQUEST_CHANGES")}
          disabled={busy || (showNotes && !notes.trim())}
        >
          {showNotes ? "Submit Change Request" : "Request Changes"}
        </Button>
      </div>
      <FieldError>{error ?? undefined}</FieldError>
    </div>
  );
}
