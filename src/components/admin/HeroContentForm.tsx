"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import type { HeroContentInput } from "@/lib/validations/hero";

export function HeroContentForm({ initial }: { initial: HeroContentInput }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof HeroContentInput>(key: K, value: HeroContentInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save the hero content.");
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
      <div>
        <Label htmlFor="eyebrowText">Eyebrow badge</Label>
        <Input
          id="eyebrowText"
          value={values.eyebrowText}
          onChange={(e) => set("eyebrowText", e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="headingLine">Heading (serif line)</Label>
          <Input
            id="headingLine"
            value={values.headingLine}
            onChange={(e) => set("headingLine", e.target.value)}
            maxLength={80}
          />
        </div>
        <div>
          <Label htmlFor="headingScript">Heading (script accent)</Label>
          <Input
            id="headingScript"
            value={values.headingScript}
            onChange={(e) => set("headingScript", e.target.value)}
            maxLength={60}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={400}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="primaryCtaLabel">Primary button label</Label>
          <Input
            id="primaryCtaLabel"
            value={values.primaryCtaLabel}
            onChange={(e) => set("primaryCtaLabel", e.target.value)}
            maxLength={40}
          />
        </div>
        <div>
          <Label htmlFor="primaryCtaHref">Primary button link</Label>
          <Input
            id="primaryCtaHref"
            value={values.primaryCtaHref}
            onChange={(e) => set("primaryCtaHref", e.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="secondaryCtaLabel">Secondary button label</Label>
          <Input
            id="secondaryCtaLabel"
            value={values.secondaryCtaLabel}
            onChange={(e) => set("secondaryCtaLabel", e.target.value)}
            maxLength={40}
          />
        </div>
        <div>
          <Label htmlFor="secondaryCtaHref">Secondary button link</Label>
          <Input
            id="secondaryCtaHref"
            value={values.secondaryCtaHref}
            onChange={(e) => set("secondaryCtaHref", e.target.value)}
            maxLength={200}
          />
        </div>
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
