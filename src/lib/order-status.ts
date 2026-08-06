import type { OrderStatus } from "@prisma/client";

/**
 * The happy-path sequence admin advances/reverts an order through one step at
 * a time. Customized orders go through the design/approval loop; standard
 * (non-customizable) orders skip straight from CONFIRMED to PRODUCTION —
 * there's no design step to show a customer who didn't order anything custom.
 */
export const CUSTOM_ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CUSTOMIZATION_RECEIVED",
  "DESIGNING",
  "WAITING_APPROVAL",
  "APPROVED",
  "PRODUCTION",
  "READY",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export const STANDARD_ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PRODUCTION",
  "READY",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export function getOrderFlow(isCustomized: boolean): OrderStatus[] {
  return isCustomized ? CUSTOM_ORDER_FLOW : STANDARD_ORDER_FLOW;
}

/**
 * Every status an admin can jump an order to directly, in display order.
 * Unlike `getAvailableTransitions` (one step forward/back), this is the full
 * list — admins are trusted to set any status directly, not just advance
 * step-by-step.
 */
export function getAllStatusOptions(isCustomized: boolean): OrderStatus[] {
  return [...getOrderFlow(isCustomized), "CANCELLED", "REFUNDED"];
}

/**
 * Resolves which flow an order's current status actually lives in. Normally
 * that's just `getOrderFlow(isCustomized)`, but an order can be sitting in a
 * customization-only status (e.g. DESIGNING) that predates this category
 * split, or whose customization link was removed after the fact — in that
 * case fall back to whichever flow actually contains the status, so the
 * order never gets stranded with an empty transitions list.
 */
export function resolveOrderFlow(current: OrderStatus, isCustomized: boolean) {
  const flow = getOrderFlow(isCustomized);
  const index = flow.indexOf(current);
  if (index !== -1) return { flow, index };

  const otherFlow = getOrderFlow(!isCustomized);
  const otherIndex = otherFlow.indexOf(current);
  if (otherIndex !== -1) return { flow: otherFlow, index: otherIndex };

  return { flow, index: -1 };
}

export type OrderStatusBadgeVariant = "neutral" | "gold" | "sage" | "success" | "error" | "warning";

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, OrderStatusBadgeVariant> = {
  PENDING: "neutral",
  CONFIRMED: "gold",
  CUSTOMIZATION_RECEIVED: "gold",
  DESIGNING: "gold",
  WAITING_APPROVAL: "warning",
  APPROVED: "sage",
  PRODUCTION: "gold",
  READY: "sage",
  PACKED: "sage",
  SHIPPED: "sage",
  DELIVERED: "success",
  CANCELLED: "error",
  REFUNDED: "error",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CUSTOMIZATION_RECEIVED: "Customization Received",
  DESIGNING: "Designing",
  WAITING_APPROVAL: "Awaiting Your Approval",
  APPROVED: "Approved",
  PRODUCTION: "In Production",
  READY: "Ready",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};
