"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { DesignDoc } from "@/lib/studio/doc";

const StaticDesignPreview = dynamic(
  () => import("@/components/studio/StaticDesignPreview").then((m) => m.StaticDesignPreview),
  { ssr: false, loading: () => <Loader2 className="h-5 w-5 animate-spin text-muted" /> },
);

/** Category card cover drawn live from its first template (until a cover image is uploaded). */
export function CategoryCover({ doc }: { doc: DesignDoc }) {
  return <StaticDesignPreview doc={doc} className="absolute inset-0 p-5" />;
}
