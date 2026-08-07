"use client";

import { Upload, X } from "lucide-react";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import type { CustomizationFieldLike } from "@/lib/customization";
import { compressImage } from "@/lib/image-compress";

type FieldValue = string | number | boolean | undefined;

export function DynamicField({
  field,
  value,
  onChange,
  file,
  onFileChange,
  error,
}: {
  field: CustomizationFieldLike;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  error?: string;
}) {
  const label = (
    <Label htmlFor={field.id}>
      {field.label}
      {field.isRequired && <span className="text-error"> *</span>}
    </Label>
  );

  switch (field.fieldType) {
    case "TEXT":
      return (
        <div>
          {label}
          <Input
            id={field.id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            maxLength={field.maxValue ? Number(field.maxValue) : undefined}
            placeholder={field.placeholder ?? undefined}
          />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "TEXTAREA":
      return (
        <div>
          {label}
          <Textarea
            id={field.id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            maxLength={field.maxValue ? Number(field.maxValue) : undefined}
            placeholder={field.placeholder ?? undefined}
          />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "NUMBER":
      return (
        <div>
          {label}
          <Input
            id={field.id}
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            required={field.isRequired}
            min={field.minValue ? Number(field.minValue) : undefined}
            max={field.maxValue ? Number(field.maxValue) : undefined}
          />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "DATE":
      return (
        <div>
          {label}
          <Input
            id={field.id}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
          />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "COLOR":
      return (
        <div>
          {label}
          <div className="flex items-center gap-3">
            <input
              id={field.id}
              type="color"
              value={(value as string) || "#a67c3d"}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-border bg-paper"
            />
            <span className="text-sm text-muted">{(value as string) || "Choose a color"}</span>
          </div>
          <FieldError>{error}</FieldError>
        </div>
      );

    case "DROPDOWN":
      return (
        <div>
          {label}
          <select
            id={field.id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            className="w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Select…</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError>{error}</FieldError>
        </div>
      );

    case "CHECKBOX":
      return (
        <div>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              id={field.id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-gold"
            />
            {field.label}
            {field.isRequired && <span className="text-error"> *</span>}
          </label>
          <FieldError>{error}</FieldError>
        </div>
      );

    case "IMAGE_UPLOAD":
    case "FILE_UPLOAD":
      return (
        <div>
          {label}
          {file ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-navy">
              <span className="flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onFileChange?.(null)}
                aria-label="Remove file"
                className="text-muted hover:text-error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3.5 py-2.5 text-sm text-muted hover:border-gold/40 hover:text-gold-dark">
              <Upload className="h-4 w-4" />
              Choose a file
              <input
                id={field.id}
                type="file"
                accept={field.fieldType === "IMAGE_UPLOAD" ? "image/*" : undefined}
                onChange={async (e) => {
                  const picked = e.target.files?.[0] ?? null;
                  onFileChange?.(picked ? await compressImage(picked) : null);
                }}
                className="hidden"
              />
            </label>
          )}
          <FieldError>{error}</FieldError>
        </div>
      );

    default:
      return null;
  }
}
