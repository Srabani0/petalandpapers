import { Loader2 } from "lucide-react";

/** The editor opens full-screen — show a matching full-screen loader. */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-paper" aria-busy="true">
      <Loader2 className="h-7 w-7 animate-spin text-gold" />
      <p className="font-display text-lg text-navy">Opening your design…</p>
    </div>
  );
}
