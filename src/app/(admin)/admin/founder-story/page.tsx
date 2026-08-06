import type { Metadata } from "next";
import { getFounderStory } from "@/lib/founder-story";
import { FounderStoryForm } from "@/components/admin/FounderStoryForm";

export const metadata: Metadata = { title: "Founder Story" };

export default async function AdminFounderStoryPage() {
  const story = await getFounderStory();

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Founder Story</h1>
      <p className="mt-1 text-sm text-muted">
        Edit the &quot;thank you&quot; section shown on the homepage, just before customer
        reviews.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-paper p-5 sm:p-6">
        <FounderStoryForm
          initial={{
            photoUrl: story.photoUrl ?? "",
            heading: story.heading,
            message: story.message,
            founderName: story.founderName,
          }}
        />
      </div>
    </div>
  );
}
