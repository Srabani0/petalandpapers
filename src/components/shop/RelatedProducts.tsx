import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/shop/ProductGrid";
import type { ProductCardData } from "@/components/shop/ProductCard";

export function RelatedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <div>
      <SectionHeading eyebrow="Pairs Beautifully" title="You May Also Love" align="left" />
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
