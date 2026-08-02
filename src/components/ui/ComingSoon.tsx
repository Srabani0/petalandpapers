import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
        <Icon className="h-7 w-7" />
      </span>
      <h1 className="font-display text-3xl text-navy">{title}</h1>
      <p className="max-w-md text-muted">{description}</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </Container>
  );
}
