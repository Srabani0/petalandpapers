"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CustomerNotes({ customerId, initialNotes }: { customerId: string; initialNotes: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save notes.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="Internal notes about this customer — visible to admins only."
      />
      <FieldError>{error ?? undefined}</FieldError>
      <div className="mt-2 flex items-center gap-3">
        <Button type="button" size="sm" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Notes"}
        </Button>
        {saved ? <span className="text-sm text-sage-dark">Saved.</span> : null}
      </div>
    </div>
  );
}
