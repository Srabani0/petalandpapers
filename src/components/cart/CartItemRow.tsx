"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, Trash2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { productPath } from "@/lib/seo/site";

export interface CartItemView {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  stock: number;
  isCustomized: boolean;
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  busy,
}: {
  item: CartItemView;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex gap-4 border-b border-border py-5 last:border-0">
      <Link
        href={productPath({ id: item.productId, name: item.productName })}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-cream-dark"
      >
        {item.productImage ? (
          <Image src={item.productImage} alt={item.productName} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={productPath({ id: item.productId, name: item.productName })}
              className="font-display text-sm text-navy hover:text-gold-dark sm:text-base"
            >
              {item.productName}
            </Link>
            {item.isCustomized && (
              <Badge variant="gold" className="mt-1 block w-fit">
                <Sparkles className="h-3 w-3" />
                Customized
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label="Remove item"
            className="text-muted hover:text-error disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={busy || item.quantity <= 1 || item.isCustomized}
              className="flex h-8 w-8 items-center justify-center text-navy disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm text-navy">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={busy || item.quantity >= item.stock || item.isCustomized}
              className="flex h-8 w-8 items-center justify-center text-navy disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="font-medium text-navy">
            ₹{(item.unitPrice * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
