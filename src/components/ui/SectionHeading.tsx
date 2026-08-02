import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
          <span className="h-px w-6 bg-gold" />
          {eyebrow}
          <span className="h-px w-6 bg-gold" />
        </span>
      ) : null}
      <h2 className="font-display text-3xl text-navy sm:text-4xl">{title}</h2>
      {description ? (
        <p className={cn("max-w-2xl text-muted", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
