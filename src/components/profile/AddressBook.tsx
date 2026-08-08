"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

export interface AddressView {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const emptyForm = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
};

export function AddressBook({ addresses }: { addresses: AddressView[] }) {
  const [list, setList] = useState(addresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(addr: AddressView) {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? "",
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = editingId ? `/api/profile/addresses/${editingId}` : "/api/profile/addresses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, isDefault: !editingId && list.length === 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save this address.");
        return;
      }
      setList((prev) =>
        editingId ? prev.map((a) => (a.id === editingId ? data.address : a)) : [data.address, ...prev],
      );
      closeForm();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => {
          const removed = prev.find((a) => a.id === id);
          const remaining = prev.filter((a) => a.id !== id);
          if (removed?.isDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return remaining;
        });
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/profile/addresses/${id}/default`, { method: "PATCH" });
      if (res.ok) {
        setList((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {list.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-4 text-sm",
                addr.isDefault ? "border-gold bg-gold/5" : "border-border bg-paper",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-navy">
                  {addr.fullName}
                  {addr.label ? ` · ${addr.label}` : ""}
                </p>
                {addr.isDefault ? (
                  <span className="shrink-0 text-xs font-medium text-gold-dark">Default</span>
                ) : null}
              </div>
              <p className="text-muted">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} —{" "}
                {addr.pincode}
              </p>
              <p className="text-muted">{addr.phone}</p>

              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => openEditForm(addr)}
                  className="inline-flex items-center gap-1 font-medium text-navy hover:text-gold-dark"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={busyId === addr.id}
                    className="inline-flex items-center gap-1 font-medium text-navy hover:text-gold-dark disabled:opacity-50"
                  >
                    <Star className="h-3.5 w-3.5" /> Set Default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={busyId === addr.id}
                  className="inline-flex items-center gap-1 font-medium text-error hover:opacity-80 disabled:opacity-50"
                >
                  {busyId === addr.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">You haven&apos;t saved any addresses yet.</p>
      )}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-paper p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={form.addressLine1}
              onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
              required
              minLength={3}
            />
          </div>

          <div>
            <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
            <Input
              id="addressLine2"
              value={form.addressLine2}
              onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={form.pincode}
                onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                required
                pattern="\d{6}"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Home, Work…"
            />
          </div>

          <FieldError>{error ?? undefined}</FieldError>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Save Address"}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" onClick={openAddForm} className="self-start">
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      )}
    </div>
  );
}
