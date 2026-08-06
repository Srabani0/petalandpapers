"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import type { FounderStoryInput } from "@/lib/validations/founder-story";

export function FounderStoryForm({ initial }: { initial: FounderStoryInput }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FounderStoryInput>(key: K, value: FounderStoryInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/founder-story", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save the founder story.");
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
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <SingleImageUpload
        label="Founder Photo"
        value={values.photoUrl ?? ""}
        onChange={(url) => set("photoUrl", url)}
        uploadEndpoint="/api/admin/founder-story/upload-image"
      />

      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={values.heading}
          onChange={(e) => set("heading", e.target.value)}
          maxLength={120}
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          maxLength={1000}
          rows={6}
        />
      </div>

      <div>
        <Label htmlFor="founderName">Founder Name (signature)</Label>
        <Input
          id="founderName"
          value={values.founderName}
          onChange={(e) => set("founderName", e.target.value)}
          maxLength={80}
        />
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        {saved ? (
          <span className="flex items-center gap-1.5 text-sm text-sage-dark">
            <Check className="h-4 w-4" />
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
