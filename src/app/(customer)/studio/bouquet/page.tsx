import type { Metadata } from "next";
import Link from "next/link";
import { Flower2 } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { BouquetBuilder } from "@/components/studio/bouquet/BouquetBuilder";
import { getCurrentUser } from "@/lib/auth/session";
import { getBouquetTemplate, getOwnDesign } from "@/lib/studio/server";
import { DEFAULT_RECIPE } from "@/lib/studio/bouquet";
import { bouquetRecipeSchema, parseDesignDoc, type BouquetRecipe } from "@/lib/studio/doc";

/** Reads a recipe packed into the URL by the builder (base64url JSON). */
function decodeRecipe(value: string | undefined): BouquetRecipe | null {
  if (!value || value.length > 4000) return null;
  try {
    const json = Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const parsed = bouquetRecipeSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build Your Own Pipe Cleaner Bouquet",
  description:
    "Design a handmade pipe cleaner flower bouquet online — choose sunflowers, roses, tulips, daisies and more, pick the wrapping paper and ribbon, add a gift tag message, and see it come together live.",
  alternates: { canonical: "/studio/bouquet" },
};

interface Props {
  searchParams: Promise<{ design?: string; r?: string }>;
}

export default async function BouquetPage({ searchParams }: Props) {
  const { design: designId, r } = await searchParams;
  const [template, session] = await Promise.all([getBouquetTemplate(), getCurrentUser()]);
  if (!template) {
    return <ComingSoon icon={Flower2} title="Bouquet Builder" description="Our bouquet builder is blooming soon — check back shortly!" />;
  }

  // "Edit bouquet" from the editor: start from that design's recipe.
  let initial: BouquetRecipe = decodeRecipe(r) ?? DEFAULT_RECIPE;
  let editing: string | undefined;
  if (designId && session) {
    const design = await getOwnDesign(session.sub, designId).catch(() => null);
    const parsed = design ? parseDesignDoc(design.canvas) : null;
    if (design && design.status === "DRAFT" && parsed && "doc" in parsed && parsed.doc.meta?.bouquet) {
      initial = parsed.doc.meta.bouquet;
      editing = design.id;
    }
  }

  return (
    <Section className="pt-6 sm:pt-10">
      <Container>
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/studio" className="hover:text-gold-dark">
            Customize
          </Link>
          {" / "}
          <span className="text-navy">Bouquet Builder</span>
        </nav>
        <div className="mt-3 mb-6 max-w-2xl sm:mb-8">
          <h1 className="font-display text-3xl text-navy sm:text-4xl">Build your own bouquet</h1>
          <p className="mt-2 text-muted">
            Every flower is shaped by hand from soft pipe cleaners. Pick your favourites, choose the wrap and ribbon, and watch
            your bouquet come together.
          </p>
        </div>
        <BouquetBuilder initial={initial} designId={editing} />
      </Container>
    </Section>
  );
}
