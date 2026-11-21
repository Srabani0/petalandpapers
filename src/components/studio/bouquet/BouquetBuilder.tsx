"use client";

/* eslint-disable @next/next/no-img-element -- small transparent flower thumbnails */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Minus, Plus, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { BouquetRecipe } from "@/lib/studio/doc";
import {
  BOUQUET_FLOWERS,
  BOUQUET_GROUPS,
  BOUQUET_SIZES,
  FILLERS,
  RIBBONS,
  WRAPS,
  buildBouquetDoc,
  priceRecipe,
} from "@/lib/studio/bouquet";
import { CHENILLE } from "@/lib/studio/chenille-assets";
import { STUDIO_FONTS } from "@/components/studio/fonts";
import { BouquetPreview } from "@/components/studio/bouquet/BouquetPreview";

/** Recipe packed into a URL (so it survives the trip through sign-in). */
export function encodeRecipe(recipe: BouquetRecipe) {
  const bytes = new TextEncoder().encode(JSON.stringify(recipe));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-paper p-4 sm:p-5">
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">{n}</span>
        <h2 className="font-display text-lg text-navy">{title}</h2>
        {hint ? <span className="ml-auto text-xs text-muted">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function BouquetBuilder({ initial, designId }: { initial: BouquetRecipe; designId?: string }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<BouquetRecipe>(initial);
  const [group, setGroup] = useState<string>(BOUQUET_GROUPS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<BouquetRecipe>) => setRecipe((r) => ({ ...r, ...patch }));

  const doc = useMemo(() => buildBouquetDoc(recipe), [recipe]);
  const priced = priceRecipe(recipe);
  const size = BOUQUET_SIZES.find((s) => s.id === recipe.size) ?? BOUQUET_SIZES[1];
  const stems = recipe.flowers.reduce((s, f) => s + f.count, 0);
  const countOf = (id: string) => recipe.flowers.find((f) => f.id === id)?.count ?? 0;

  const setCount = (id: string, count: number) => {
    const others = recipe.flowers.filter((f) => f.id !== id);
    update({ flowers: count > 0 ? [...others, { id, count }] : others });
  };

  const surprise = () => {
    const pool = [...BOUQUET_FLOWERS].sort(() => Math.random() - 0.5).slice(0, 3);
    const per = Math.max(1, Math.floor(size.maxStems / 3));
    update({
      flowers: pool.map((f) => ({ id: f.id, count: per })),
      wrap: WRAPS[Math.floor(Math.random() * WRAPS.length)].id,
      ribbon: RIBBONS[Math.floor(Math.random() * RIBBONS.length)].id,
      fillers: [FILLERS[Math.floor(Math.random() * FILLERS.length)].id],
    });
  };

  async function handleContinue() {
    if ("error" in priced) return setError(priced.error);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/bouquet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipe, designId }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (res.status === 401) {
        router.push(`/login?from=${encodeURIComponent(`/studio/bouquet?r=${encodeRecipe(recipe)}`)}`);
        return;
      }
      if (!res.ok || !data.id) {
        setError(data.error ?? "Couldn't save your bouquet. Please try again.");
        return;
      }
      router.push(`/studio/design/${data.id}`);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const total = "total" in priced ? priced.total : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
      {/* Make sure the tag's handwriting font is loaded. */}
      <span aria-hidden className={cn("pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0", STUDIO_FONTS.dancing.className)}>
        Aa
      </span>

      {/* Preview — sticky on desktop, compact on phones. */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#fdf9f3] to-[#f3ebdf]">
          <BouquetPreview doc={doc} className="h-[46vh] max-h-[560px] min-h-[300px] w-full sm:h-[520px]" />
          <button
            type="button"
            onClick={surprise}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            <Shuffle className="h-3.5 w-3.5" /> Surprise me
          </button>
          <p className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs text-navy backdrop-blur">
            {stems} / {size.maxStems} flowers
          </p>
        </div>
        <div className="mt-4 hidden rounded-2xl border border-border bg-paper p-5 lg:block">
          <Summary priced={priced} />
          <Button size="lg" className="mt-4 w-full" onClick={handleContinue} disabled={busy || total === null}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue — preview &amp; add to cart
          </Button>
          {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-24 lg:pb-0">
        <Step n={1} title="Choose a size">
          <div className="grid grid-cols-3 gap-2">
            {BOUQUET_SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ size: s.id })}
                className={cn(
                  "flex flex-col items-center rounded-xl border p-3 text-center transition active:scale-95",
                  recipe.size === s.id ? "border-navy bg-navy text-cream" : "border-border hover:border-gold",
                )}
              >
                <span className="font-display text-base">{s.label}</span>
                <span className={cn("text-xs", recipe.size === s.id ? "text-cream/80" : "text-muted")}>up to {s.maxStems}</span>
                <span className="mt-1 text-sm font-semibold">₹{s.base}+</span>
              </button>
            ))}
          </div>
        </Step>

        <Step n={2} title="Pick your flowers" hint={`${stems} of ${size.maxStems} added`}>
          <div className="pp-no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">
            {BOUQUET_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition",
                  group === g ? "border-navy bg-navy text-cream" : "border-border bg-white text-navy hover:border-gold",
                )}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BOUQUET_FLOWERS.filter((f) => f.group === group).map((f) => {
              const count = countOf(f.id);
              const full = stems >= size.maxStems;
              return (
                <div
                  key={f.id}
                  className={cn(
                    "flex flex-col rounded-xl border p-2 transition",
                    count > 0 ? "border-gold bg-gold/5" : "border-border bg-white",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => !full && setCount(f.id, count + 1)}
                    disabled={full}
                    className="flex aspect-square items-center justify-center rounded-lg bg-[#faf7f2] p-2 disabled:cursor-not-allowed"
                    aria-label={`Add ${f.name}`}
                  >
                    <img src={f.thumb} alt={f.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform hover:scale-105" />
                  </button>
                  <p className="mt-1.5 truncate text-xs font-medium text-navy">{f.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted">₹{f.price}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`One less ${f.name}`}
                        disabled={count === 0}
                        onClick={() => setCount(f.id, count - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-navy disabled:opacity-30 active:scale-90"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-navy tabular-nums">{count}</span>
                      <button
                        type="button"
                        aria-label={`One more ${f.name}`}
                        disabled={full}
                        onClick={() => setCount(f.id, count + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-cream disabled:opacity-30 active:scale-90"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Step>

        <Step n={3} title="Wrapping paper">
          <div className="flex flex-wrap gap-3">
            {WRAPS.map((w) => (
              <button key={w.id} type="button" onClick={() => update({ wrap: w.id })} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border shadow-inner transition active:scale-90",
                    recipe.wrap === w.id ? "ring-2 ring-gold ring-offset-2" : "border-border",
                  )}
                  style={{ backgroundColor: w.colour }}
                >
                  {recipe.wrap === w.id ? <Check className={cn("h-4 w-4", w.id === "black" ? "text-white" : "text-navy")} /> : null}
                </span>
                <span className="text-[11px] text-navy">{w.label}</span>
                <span className="text-[10px] text-muted">{w.price ? `+₹${w.price}` : "Free"}</span>
              </button>
            ))}
          </div>
        </Step>

        <Step n={4} title="Ribbon">
          <div className="flex flex-wrap gap-3">
            {RIBBONS.map((r) => (
              <button key={r.id} type="button" onClick={() => update({ ribbon: r.id })} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-9 w-9 rounded-full border transition active:scale-90",
                    recipe.ribbon === r.id ? "ring-2 ring-gold ring-offset-2" : "border-border",
                  )}
                  style={{ background: `linear-gradient(135deg, ${r.colour}, ${r.colour}cc 50%, ${r.colour})` }}
                />
                <span className="text-[11px] text-navy">{r.label}</span>
              </button>
            ))}
          </div>
        </Step>

        <Step n={5} title="Add greenery" hint="₹25 each">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FILLERS.map((f) => {
              const on = recipe.fillers.includes(f.id);
              const asset = CHENILLE[f.asset];
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => update({ fillers: on ? recipe.fillers.filter((x) => x !== f.id) : [...recipe.fillers, f.id] })}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2 text-left transition active:scale-95",
                    on ? "border-gold bg-gold/5" : "border-border bg-white hover:border-gold",
                  )}
                >
                  {asset ? <img src={asset.src.replace("/chenille/", "/chenille/t/")} alt="" className="h-9 w-9 object-contain" /> : null}
                  <span className="text-xs font-medium text-navy">{f.label}</span>
                  {on ? <Check className="ml-auto h-4 w-4 text-gold-dark" /> : null}
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={6} title="Gift tag message" hint="Optional">
          <div className="flex flex-col gap-2">
            <textarea
              value={recipe.message}
              maxLength={60}
              rows={2}
              placeholder="Happy Birthday! / I love you / Thank you, Teacher"
              onChange={(e) => update({ message: e.target.value })}
              className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-ink focus:border-gold focus:outline-none"
            />
            <input
              value={recipe.from}
              maxLength={30}
              placeholder="From (your name)"
              onChange={(e) => update({ from: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink focus:border-gold focus:outline-none"
            />
            <p className="text-xs text-muted">{60 - recipe.message.length} characters left · handwritten on a kraft tag</p>
          </div>
        </Step>
      </div>

      {/* Phones: price + continue pinned to the bottom. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_24px_-18px_rgba(30,42,74,0.45)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{"error" in priced ? priced.error : `${stems} flowers · total`}</p>
            <p className="font-display text-xl leading-tight text-navy">{total !== null ? `₹${total}` : "—"}</p>
          </div>
          <Button size="lg" className="shrink-0" onClick={handleContinue} disabled={busy || total === null}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </Button>
        </div>
        {error ? <p className="mx-auto mt-1 max-w-md text-xs text-error">{error}</p> : null}
      </div>
    </div>
  );
}

function Summary({ priced }: { priced: ReturnType<typeof priceRecipe> }) {
  if ("error" in priced) return <p className="text-sm text-error">{priced.error}</p>;
  return (
    <div>
      <p className="font-display text-base text-navy">Your bouquet</p>
      <ul className="mt-2 space-y-1 text-sm">
        {priced.lines.map((l) => (
          <li key={l.label} className="flex justify-between gap-3 text-muted">
            <span className="truncate">{l.label}</span>
            <span className="tabular-nums">₹{l.amount}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg text-navy">
        <span>Total</span>
        <span>₹{priced.total}</span>
      </p>
    </div>
  );
}
