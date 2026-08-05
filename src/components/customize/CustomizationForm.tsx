"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Textarea, FieldError, FieldHint } from "@/components/ui/Input";
import { DynamicField } from "@/components/customize/DynamicField";
import { PhotoUploader } from "@/components/customize/PhotoUploader";
import { validateCustomizationFormData, type CustomizationFieldLike } from "@/lib/customization";

type FieldValue = string | number | boolean | undefined;

export function CustomizationForm({
  productId,
  productName,
  formTitle,
  formDescription,
  fields,
  minPhotos,
  maxPhotos,
}: {
  productId: string;
  productName: string;
  formTitle: string;
  formDescription: string | null;
  fields: CustomizationFieldLike[];
  minPhotos: number;
  maxPhotos: number;
}) {
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [fieldFiles, setFieldFiles] = useState<Record<string, File | null>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [referenceDesigns, setReferenceDesigns] = useState<File[]>([]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const validationInput: Record<string, FieldValue> = { ...values };
    for (const field of fields) {
      if (field.fieldType === "IMAGE_UPLOAD" || field.fieldType === "FILE_UPLOAD") {
        validationInput[field.id] = fieldFiles[field.id] ? "present" : undefined;
      }
    }
    const { valid, errors: fieldErrors } = validateCustomizationFormData(fields, validationInput);

    if (photos.length < minPhotos) {
      fieldErrors._photos = `Please add at least ${minPhotos} photo${minPhotos === 1 ? "" : "s"}.`;
    } else if (photos.length > maxPhotos) {
      fieldErrors._photos = `Please add at most ${maxPhotos} photo${maxPhotos === 1 ? "" : "s"}.`;
    }

    setErrors(fieldErrors);
    if (!valid || Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("productId", productId);
      body.set("customerNotes", customerNotes);
      body.set(
        "formData",
        JSON.stringify(
          Object.fromEntries(
            fields
              .filter((f) => f.fieldType !== "IMAGE_UPLOAD" && f.fieldType !== "FILE_UPLOAD")
              .map((f) => [f.id, values[f.id] ?? ""]),
          ),
        ),
      );
      photos.forEach((file) => body.append("photos", file));
      referenceDesigns.forEach((file) => body.append("referenceDesigns", file));
      for (const field of fields) {
        const file = fieldFiles[field.id];
        if (file) body.set(`field_${field.id}`, file);
      }

      const res = await fetch("/api/customizations", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const cartRes = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          customizationRequestId: data.customizationRequest.id,
        }),
      });
      setAddedToCart(cartRes.ok);
      setSuccess(true);
      router.refresh();
    } catch {
      setFormError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-sage/30 bg-sage/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-sage-dark" />
        <h2 className="mt-4 font-display text-xl text-navy">Your customization is saved</h2>
        <p className="mt-2 text-sm text-muted">
          {addedToCart
            ? `We've added your customized ${productName} to your cart.`
            : `We've saved your details for ${productName}, but couldn't add it to your cart automatically — please try adding it again from your cart.`}
        </p>
        <Link href="/cart" className="mt-6 inline-block text-sm font-medium text-gold-dark hover:underline">
          Go to cart
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-navy">{formTitle}</h2>
        {formDescription ? <p className="mt-1 text-sm text-muted">{formDescription}</p> : null}
      </div>

      <div className="flex flex-col gap-5">
        {fields.map((field) => (
          <DynamicField
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
            file={fieldFiles[field.id]}
            onFileChange={(file) => setFieldFiles((prev) => ({ ...prev, [field.id]: file }))}
            error={errors[field.id]}
          />
        ))}
      </div>

      <div>
        <Label>
          Your Photos
          <span className="text-error"> *</span>
        </Label>
        <FieldHint>
          {minPhotos === maxPhotos
            ? `Upload exactly ${minPhotos} photo${minPhotos === 1 ? "" : "s"}.`
            : `Upload ${minPhotos}–${maxPhotos} photos.`}
        </FieldHint>
        <div className="mt-2">
          <PhotoUploader files={photos} onChange={setPhotos} max={maxPhotos} />
        </div>
        <FieldError>{errors._photos}</FieldError>
      </div>

      <div>
        <Label>Reference Designs (optional)</Label>
        <FieldHint>Have an inspiration photo or design in mind? Add up to 5.</FieldHint>
        <div className="mt-2">
          <PhotoUploader files={referenceDesigns} onChange={setReferenceDesigns} max={5} />
        </div>
      </div>

      <div>
        <Label htmlFor="customerNotes">Anything else we should know?</Label>
        <Textarea
          id="customerNotes"
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="Special instructions, timing needs, etc."
        />
      </div>

      <FieldError>{formError ?? undefined}</FieldError>

      <Button type="submit" size="lg" disabled={submitting} className="self-start">
        <Sparkles className="h-4 w-4" />
        {submitting ? "Saving…" : "Save My Customization"}
      </Button>
    </form>
  );
}
