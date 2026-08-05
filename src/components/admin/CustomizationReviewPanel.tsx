"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CustomizationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Label, Textarea, FieldError } from "@/components/ui/Input";

const STATUS_LABEL: Record<CustomizationStatus, string> = {
  PENDING: "Pending",
  RECEIVED: "Received",
  IN_DESIGN: "In Design",
  AWAITING_APPROVAL: "Awaiting Customer Approval",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes Requested",
  REJECTED: "Rejected",
};

const MANUAL_STATUSES: CustomizationStatus[] = ["PENDING", "RECEIVED", "IN_DESIGN", "REJECTED"];

export function CustomizationReviewPanel({
  id,
  productName,
  status,
  previewDesignUrl,
  customerNotes,
  adminNotes,
  uploadedPhotos,
  referenceDesigns,
}: {
  id: string;
  productName: string;
  status: CustomizationStatus;
  previewDesignUrl: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  uploadedPhotos: string[];
  referenceDesigns: string[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [manualStatus, setManualStatus] = useState<CustomizationStatus>(
    MANUAL_STATUSES.includes(status) ? status : "PENDING",
  );
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.set("preview", file);
      const res = await fetch(`/api/admin/customizations/${id}/preview`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Couldn't upload the preview.");
        return;
      }
      setFile(null);
      router.refresh();
    } catch {
      setUploadError("Couldn't reach the server. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleStatusSave() {
    setSavingStatus(true);
    setStatusError(null);
    try {
      const res = await fetch(`/api/admin/customizations/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: manualStatus, adminNotes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(data.error ?? "Couldn't save.");
        return;
      }
      router.refresh();
    } catch {
      setStatusError("Couldn't reach the server. Please try again.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-navy">{productName}</p>
        <Badge variant={status === "APPROVED" ? "success" : status === "CHANGES_REQUESTED" || status === "REJECTED" ? "error" : "gold"}>
          {STATUS_LABEL[status]}
        </Badge>
      </div>

      {customerNotes ? <p className="mt-2 text-sm text-muted whitespace-pre-line">{customerNotes}</p> : null}

      {uploadedPhotos.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs tracking-wide text-muted uppercase">Customer Photos</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {uploadedPhotos.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="relative h-16 w-16 overflow-hidden rounded-md border border-border bg-cream-dark">
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {referenceDesigns.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs tracking-wide text-muted uppercase">Reference Designs</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {referenceDesigns.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="relative h-16 w-16 overflow-hidden rounded-md border border-border bg-cream-dark">
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {previewDesignUrl ? (
        <div className="mt-3">
          <p className="text-xs tracking-wide text-muted uppercase">Current Preview</p>
          <a href={previewDesignUrl} target="_blank" rel="noreferrer" className="relative mt-1.5 block h-32 w-32 overflow-hidden rounded-md border border-border bg-cream-dark">
            <Image src={previewDesignUrl} alt="" fill sizes="128px" className="object-cover" />
          </a>
        </div>
      ) : null}

      <form onSubmit={handleUpload} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <Label htmlFor={`preview-${id}`}>Upload Design Preview</Label>
          <input
            id={`preview-${id}`}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream"
          />
        </div>
        <Button type="submit" size="sm" disabled={!file || uploading}>
          {uploading ? "Uploading…" : "Send to Customer"}
        </Button>
      </form>
      <FieldError>{uploadError ?? undefined}</FieldError>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor={`status-${id}`}>Status</Label>
            <select
              id={`status-${id}`}
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value as CustomizationStatus)}
              className="rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {MANUAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleStatusSave} disabled={savingStatus}>
            {savingStatus ? "Saving…" : "Save"}
          </Button>
        </div>
        <div className="mt-3">
          <Label htmlFor={`notes-${id}`}>Admin Notes</Label>
          <Textarea id={`notes-${id}`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <FieldError>{statusError ?? undefined}</FieldError>
      </div>
    </div>
  );
}
