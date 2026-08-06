import type { Metadata } from "next";
import { getHeroContent, MAX_HERO_IMAGES } from "@/lib/hero";
import { HeroContentForm } from "@/components/admin/HeroContentForm";
import { HeroImageManager } from "@/components/admin/HeroImageManager";

export const metadata: Metadata = { title: "Hero Section" };

export default async function AdminHeroPage() {
  const content = await getHeroContent();

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Hero Section</h1>
      <p className="mt-1 text-sm text-muted">
        Edit the homepage hero — heading, copy, buttons, and the bouquet showcase photos.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Content</h2>
          <div className="mt-4">
            <HeroContentForm
              initial={{
                eyebrowText: content.eyebrowText,
                headingLine: content.headingLine,
                headingScript: content.headingScript,
                description: content.description,
                primaryCtaLabel: content.primaryCtaLabel,
                primaryCtaHref: content.primaryCtaHref,
                secondaryCtaLabel: content.secondaryCtaLabel,
                secondaryCtaHref: content.secondaryCtaHref,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Showcase Photos</h2>
          <div className="mt-4">
            <HeroImageManager
              images={content.images.map((img) => ({ id: img.id, url: img.url }))}
              max={MAX_HERO_IMAGES}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
