"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Loader2, Save, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DesignDoc, StudioKind } from "@/lib/studio/doc";
import type { StudioElement } from "@/components/studio/editor/Sidebar";
import type { EditorApi } from "@/components/studio/editor/DesignEditor";
import { describeExportError, renderDesignFiles } from "@/components/studio/render";

// Konva needs the browser — never render the editor on the server.
const DesignEditor = dynamic(() => import("@/components/studio/editor/DesignEditor").then((m) => m.DesignEditor), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center gap-2 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading the design studio…
    </div>
  ),
});

export function CustomerStudio({
  designId,
  initialDoc,
  elements,
  kind,
  templateName,
  sizeLabel,
  price,
  categorySlug,
  categoryName,
  ordered,
  inCart,
}: {
  designId: string;
  initialDoc: DesignDoc;
  elements: StudioElement[];
  kind: StudioKind;
  templateName: string;
  sizeLabel: string;
  price: number;
  categorySlug: string;
  categoryName: string;
  ordered: boolean;
  inCart: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "save" | "cart" | "copy">(null);
  const [isInCart, setIsInCart] = useState(inCart);

  async function save(api: EditorApi): Promise<boolean> {
    const { doc, revision } = api.snapshot();
    let files: Awaited<ReturnType<typeof renderDesignFiles>>;
    try {
      files = await renderDesignFiles(api);
    } catch (err) {
      api.notify("error", describeExportError(err));
      return false;
    }

    const body = new FormData();
    body.append("canvas", JSON.stringify(doc));
    body.append("preview", files.preview);
    body.append("print", files.print);

    try {
      const res = await fetch(`/api/studio/designs/${designId}`, { method: "PUT", body });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        api.notify("error", "Your session expired — please sign in again in a new tab, then save.");
        return false;
      }
      if (!res.ok) {
        api.notify("error", data.error ?? "Couldn't save your design.");
        return false;
      }
      api.markSaved(revision);
      return true;
    } catch {
      api.notify("error", "Couldn't reach the server. Check your connection and try again.");
      return false;
    }
  }

  async function addToCart(api: EditorApi, close: () => void) {
    setBusy("cart");
    try {
      if (!isInCart) {
        const res = await fetch(`/api/studio/designs/${designId}/cart`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ quantity: 1 }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          api.notify("error", data.error ?? "Couldn't add to cart.");
          return;
        }
        setIsInCart(true);
      }
      close();
      router.push("/cart");
      router.refresh();
    } catch {
      api.notify("error", "Couldn't reach the server. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function emptyWarning(api: EditorApi) {
    return api.emptySlots > 0 ? (
      <span className="text-warning">
        {api.emptySlots} photo frame{api.emptySlots === 1 ? " is" : "s are"} still empty and will be printed blank.
      </span>
    ) : (
      "Drag to turn it around and check the back. This is how we'll make it."
    );
  }

  async function handleSave(api: EditorApi) {
    setBusy("save");
    const ok = await save(api);
    setBusy(null);
    if (!ok) return;
    api.show3D({
      title: "Saved! Here's how it will look",
      subtitle: emptyWarning(api),
      footer: (close) => (
        <>
          <Button variant="ghost" onClick={close}>
            Keep editing
          </Button>
          <Button onClick={() => addToCart(api, close)} disabled={busy !== null}>
            <ShoppingBag className="h-4 w-4" />
            {isInCart ? "Go to cart" : `Add to cart · ₹${price.toFixed(0)}`}
          </Button>
        </>
      ),
    });
  }

  /** Saves, then shows the final 3D look and asks for confirmation before adding. */
  async function handleAddToCart(api: EditorApi) {
    setBusy("cart");
    const ok = api.dirty || !inCart ? await save(api) : true;
    setBusy(null);
    if (!ok) return;
    api.show3D({
      title: "Your finished piece",
      subtitle: emptyWarning(api),
      footer: (close) => (
        <>
          <Button variant="ghost" onClick={close}>
            Keep editing
          </Button>
          <Button onClick={() => addToCart(api, close)}>
            <ShoppingBag className="h-4 w-4" />
            {isInCart ? "Looks good — view cart" : `Looks good — add to cart · ₹${price.toFixed(0)}`}
          </Button>
        </>
      ),
    });
  }

  async function handleCopy(api: EditorApi) {
    setBusy("copy");
    try {
      const res = await fetch("/api/studio/designs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fromDesignId: designId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        api.notify("error", data.error ?? "Couldn't copy the design.");
        return;
      }
      router.push(`/studio/design/${data.id}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <DesignEditor
      mode="customer"
      initialDoc={initialDoc}
      elements={elements}
      kind={kind}
      uploadEndpoint="/api/studio/uploads"
      readOnly={ordered}
      className="lg:h-[calc(100dvh-7.5rem)] lg:min-h-[620px]"
      header={
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/${categorySlug}`}
            aria-label={`Back to ${categoryName}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-navy hover:bg-cream-dark"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate font-display text-base text-navy">{templateName}</p>
            <p className="truncate text-xs text-muted">
              {sizeLabel} · ₹{price.toFixed(2)}
            </p>
          </div>
        </div>
      }
      renderActions={(api) =>
        ordered ? (
          <Button size="sm" onClick={() => handleCopy(api)} disabled={busy !== null}>
            {busy === "copy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            Make a copy to edit
          </Button>
        ) : (
          <div className="relative flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleSave(api)} disabled={busy !== null}>
              {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {api.dirty ? "Save" : "Saved"}
            </Button>
            <Button size="sm" onClick={() => handleAddToCart(api)} disabled={busy !== null}>
              {busy === "cart" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              {isInCart ? "Update & view cart" : "Add to cart"}
            </Button>


          </div>
        )
      }
    />
  );
}
