import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center gap-2">
          <Image
            src="/brand/logo-mark.png"
            alt="Petal & Papers"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        </Link>

        <Card>
          <CardBody className="p-8">
            <h1 className="text-center font-display text-2xl text-navy">{title}</h1>
            {description ? (
              <p className="mt-2 text-center text-sm text-muted">{description}</p>
            ) : null}
            <div className="mt-6">{children}</div>
          </CardBody>
        </Card>

        {footer ? <p className="mt-6 text-center text-sm text-muted">{footer}</p> : null}
      </div>
    </Container>
  );
}
