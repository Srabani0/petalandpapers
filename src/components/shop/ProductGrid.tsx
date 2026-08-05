import { PackageSearch } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/shop/ProductCard";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
        <PackageSearch className="h-8 w-8 text-muted" />
        <p className="text-navy">No products match your filters yet.</p>
        <p className="text-sm text-muted">Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
