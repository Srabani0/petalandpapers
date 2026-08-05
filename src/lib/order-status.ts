import type { OrderStatus } from "@prisma/client";

/** The happy-path sequence admin advances/reverts an order through one step at a time. */
export const ORDER_FLOW: OrderStatus[] = [
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

/**
 * Returns the statuses this order can legally move to next: one step forward
 * or back along ORDER_FLOW, plus CANCELLED/REFUNDED where they make sense.
 * Kept as a single-step machine (not free-form) per the SRS's "advance/revert"
 * model — CANCELLED and REFUNDED are the only exceptions, reachable early or
 * late respectively.
 */
export function getAvailableTransitions(current: OrderStatus): OrderStatus[] {
  const index = ORDER_FLOW.indexOf(current);
  const transitions: OrderStatus[] = [];

  if (index === -1) {
    // CANCELLED or REFUNDED
    if (current === "CANCELLED") transitions.push("REFUNDED");
    return transitions;
  }

  if (index < ORDER_FLOW.length - 1) transitions.push(ORDER_FLOW[index + 1]);
  if (index > 0) transitions.push(ORDER_FLOW[index - 1]);
  if (current !== "DELIVERED") transitions.push("CANCELLED");
  if (current === "DELIVERED") transitions.push("REFUNDED");

  return transitions;
}
