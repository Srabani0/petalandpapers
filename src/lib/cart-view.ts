import type { CartItemView } from "@/components/cart/CartItemRow";
import { MAX_DESIGN_QUANTITY_CLIENT } from "@/lib/cart-constants";
import { productPath } from "@/lib/seo/site";

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
  design?: {
    id: string;
    previewUrl: string | null;
    printUrl: string | null;
    template: { name: string; sizeLabel: string };
  } | null;
}

/** Flattens a Prisma cart item (with product/image relations) into the shape CartItemRow renders. */
export function toCartItemView(item: RawCartItem): CartItemView {
  if (item.design) {
    return {
      id: item.id,
      productId: item.productId,
      productName: `${item.design.template.name} · ${item.design.template.sizeLabel}`,
      productImage: item.design.previewUrl,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      stock: MAX_DESIGN_QUANTITY_CLIENT,
      isCustomized: true,
      href: `/studio/design/${item.design.id}`,
      designNeedsSave: !item.design.printUrl,
    };
  }

  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.images[0]?.url ?? null,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    stock: item.product.stock,
    isCustomized: item.customizationId !== null,
    href: productPath({ id: item.productId, name: item.product.name }),
  };
}
