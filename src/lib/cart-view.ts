import type { CartItemView } from "@/components/cart/CartItemRow";

export interface RawCartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number | string;
  customizationId: string | null;
  product: {
    name: string;
    stock: number;
    images: { url: string }[];
  };
}

/** Flattens a Prisma cart item (with product/image relations) into the shape CartItemRow renders. */
export function toCartItemView(item: RawCartItem): CartItemView {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.images[0]?.url ?? null,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    stock: item.product.stock,
    isCustomized: item.customizationId !== null,
  };
}
