import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { buttonVariants } from "@/components/ui/Button";
import type { ProductCardData } from "@/components/shop/ProductCard";

export function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Fresh From the Studio"
          title="Recently Added"
          description="A few of the newest pieces, ready to be made yours."
        />

        <div className="mt-12">
          <ProductGrid products={products} />
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
            View Full Shop
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
