import Link from "next/link";
import Image from "next/image";
import { Sparkles, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { productPath } from "@/lib/seo/site";

export interface ProductCardData {
  id: string;
  name: string;
  price: string;
  finalPrice: string;
  discountPercent: number;
  stock: number;
  status: "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";
  isCustomizable: boolean;
  category: { name: string };
  images: { url: string; altText: string | null }[];
  isWishlisted?: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const primaryImage = product.images[0];
  const outOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";
  const hasDiscount = product.discountPercent > 0;

  return (
    <Link
      href={productPath(product)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-paper transition-all active:scale-[0.98] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-16px_rgba(30,42,74,0.25)]"
    >
      <div className="relative aspect-square bg-cream-dark">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff className="h-8 w-8" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isCustomizable && (
            <Badge variant="gold">
              <Sparkles className="h-3 w-3" />
              Customizable
            </Badge>
          )}
          {outOfStock && <Badge variant="neutral">Out of Stock</Badge>}
        </div>

        <WishlistButton
          productId={product.id}
          initialSaved={product.isWishlisted ?? false}
          className="absolute top-2 right-2"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="truncate text-[10px] tracking-wide text-muted uppercase sm:text-xs">{product.category.name}</p>
        <h3 className="line-clamp-2 font-display text-sm leading-snug text-navy sm:text-base">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-medium text-navy">₹{product.finalPrice}</span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">₹{product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
