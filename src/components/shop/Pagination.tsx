import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      <span className="px-3 text-sm text-muted">
        Page {page} of {totalPages}
      </span>

      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-md text-muted/40">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-navy hover:bg-cream-dark",
      )}
    >
      {children}
    </Link>
  );
}
