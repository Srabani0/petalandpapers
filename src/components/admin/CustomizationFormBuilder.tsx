"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError, FieldHint } from "@/components/ui/Input";
import { CUSTOMIZATION_FIELD_TYPES } from "@/lib/validations/customization";

interface BuilderField {
  key: string; // client-only React key, not sent to the server
  id?: string; // real db id, present when loaded from an existing form
  label: string;
  fieldType: (typeof CUSTOMIZATION_FIELD_TYPES)[number];
  placeholder: string;
  isRequired: boolean;
  options: string; // comma-separated in the UI, split into an array on save
  minValue: string;
  maxValue: string;
}

const TYPE_LABELS: Record<(typeof CUSTOMIZATION_FIELD_TYPES)[number], string> = {
  TEXT: "Text",
  TEXTAREA: "Long Text",
  DROPDOWN: "Dropdown",
  COLOR: "Color Picker",
  NUMBER: "Number",
  IMAGE_UPLOAD: "Image Upload",
  FILE_UPLOAD: "File Upload",
  CHECKBOX: "Checkbox",
  DATE: "Date",
};

function newField(): BuilderField {
  return {
    key: crypto.randomUUID(),
    label: "",
    fieldType: "TEXT",
    placeholder: "",
    isRequired: true,
    options: "",
    minValue: "",
    maxValue: "",
  };
}

interface Initial {
  title: string;
  description: string;
  fields: BuilderField[];
}

export function CustomizationFormBuilder({
  productId,
  initial,
}: {
  productId: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "Customize This Gift");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fields, setFields] = useState<BuilderField[]>(initial?.fields ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField(key: string, patch: Partial<BuilderField>) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
    setSaved(false);
  }

  function removeField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key));
    setSaved(false);
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/products/${productId}/customization-form`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fields: fields.map((f, index) => ({
            id: f.id,
            label: f.label,
            fieldType: f.fieldType,
            placeholder: f.placeholder,
            isRequired: f.isRequired,
            options: f.options
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean),
            minValue: f.minValue,
            maxValue: f.maxValue,
            sortOrder: index,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save the form.");
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
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="formTitle">Form Title</Label>
        <Input id="formTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="formDescription">Instructions (shown above the form)</Label>
        <Textarea
          id="formDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell customers what to have ready before they start."
        />
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.key} className="rounded-lg border border-border bg-cream-dark/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`label-${field.key}`}>Label</Label>
                  <Input
                    id={`label-${field.key}`}
                    value={field.label}
                    onChange={(e) => updateField(field.key, { label: e.target.value })}
                    placeholder="e.g. Recipient Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`type-${field.key}`}>Field Type</Label>
                  <select
                    id={`type-${field.key}`}
                    value={field.fieldType}
                    onChange={(e) =>
                      updateField(field.key, {
                        fieldType: e.target.value as BuilderField["fieldType"],
                      })
                    }
                    className="w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {CUSTOMIZATION_FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1 pt-6">
                <button
                  type="button"
                  onClick={() => moveField(index, -1)}
                  disabled={index === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 1)}
                  disabled={index === fields.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-cream disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeField(field.key)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-error hover:bg-error/10"
                  aria-label="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`placeholder-${field.key}`}>Placeholder</Label>
                <Input
                  id={`placeholder-${field.key}`}
                  value={field.placeholder}
                  onChange={(e) => updateField(field.key, { placeholder: e.target.value })}
                />
              </div>
              <label className="mt-6 flex items-center gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={field.isRequired}
                  onChange={(e) => updateField(field.key, { isRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-border accent-gold"
                />
                Required
              </label>
            </div>

            {field.fieldType === "DROPDOWN" && (
              <div className="mt-3">
                <Label htmlFor={`options-${field.key}`}>Options (comma-separated)</Label>
                <Input
                  id={`options-${field.key}`}
                  value={field.options}
                  onChange={(e) => updateField(field.key, { options: e.target.value })}
                  placeholder="e.g. Pink, Blue, Neutral"
                  required
                />
              </div>
            )}

            {(field.fieldType === "TEXT" ||
              field.fieldType === "TEXTAREA" ||
              field.fieldType === "NUMBER") && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`min-${field.key}`}>
                    {field.fieldType === "NUMBER" ? "Min Value" : "Min Length"}
                  </Label>
                  <Input
                    id={`min-${field.key}`}
                    value={field.minValue}
                    onChange={(e) => updateField(field.key, { minValue: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`max-${field.key}`}>
                    {field.fieldType === "NUMBER" ? "Max Value" : "Max Length"}
                  </Label>
                  <Input
                    id={`max-${field.key}`}
                    value={field.maxValue}
                    onChange={(e) => updateField(field.key, { maxValue: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            No fields yet — add one below.
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setFields((prev) => [...prev, newField()])}
        className="self-start"
      >
        <Plus className="h-4 w-4" />
        Add Field
      </Button>

      <FieldError>{error ?? undefined}</FieldError>
      {saved && !error ? (
        <FieldHint>
          <span className="inline-flex items-center gap-1.5 text-sage-dark">
            <Sparkles className="h-3.5 w-3.5" />
            Saved — customers will see this form now.
          </span>
        </FieldHint>
      ) : null}

      <div>
        <Button type="submit" disabled={saving || fields.length === 0}>
          {saving ? "Saving…" : "Save Customization Form"}
        </Button>
      </div>
    </form>
  );
}
