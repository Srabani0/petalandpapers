import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Palette } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { DeleteDesignButton } from "@/components/studio/DeleteDesignButton";
import { getCurrentUser } from "@/lib/auth/session";
import { listOwnDesigns } from "@/lib/studio/server";

export const metadata: Metadata = {
  title: "My Designs",
  robots: { index: false, follow: false },
};

export default async function MyDesignsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/studio/my-designs");

  const designs = await listOwnDesigns(session.sub);

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-navy">My Designs</h1>
            <p className="mt-1 text-sm text-muted">Everything you&apos;ve created in the Design Studio.</p>
          </div>
          <Link href="/studio" className={buttonVariants({ size: "sm" })}>
            Start a new design
          </Link>
        </div>

        {designs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
            <Palette className="h-8 w-8 text-gold-dark" strokeWidth={1.5} />
            <p className="text-navy">You haven&apos;t designed anything yet.</p>
            <Link href="/studio" className="text-sm text-gold-dark underline underline-offset-4">
              Browse templates
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {designs.map((d) => (
              <article key={d.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper">
                <Link href={`/studio/design/${d.id}`} className="relative block aspect-square bg-[#ebe7df]">
                  {d.previewUrl ? (
                    <Image
                      src={d.previewUrl}
                      alt={d.template.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-muted">Not saved yet</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/studio/design/${d.id}`} className="font-display text-sm text-navy hover:text-gold-dark">
                      {d.template.name}
                    </Link>
                    {d.status === "DRAFT" ? <DeleteDesignButton designId={d.id} /> : null}
                  </div>
                  <p className="text-xs text-muted">
                    {d.template.category.name} · {d.template.sizeLabel}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    {d.status === "ORDERED" ? (
                      <Badge variant="success">Ordered</Badge>
                    ) : d.cartItems.length > 0 ? (
                      <Badge variant="gold">In cart</Badge>
                    ) : (
                      <Badge variant="neutral">Draft</Badge>
                    )}
                    <span className="text-xs text-muted">{d.updatedAt.toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
