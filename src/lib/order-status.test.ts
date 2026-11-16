import { describe, expect, it } from "vitest";
import {
  CUSTOM_ORDER_FLOW,
  ORDER_STATUS_LABEL,
  STANDARD_ORDER_FLOW,
  getAllStatusOptions,
  getOrderFlow,
  resolveOrderFlow,
} from "@/lib/order-status";

describe("order flows", () => {
  it("standard orders skip the design/approval steps", () => {
    expect(STANDARD_ORDER_FLOW).not.toContain("DESIGNING");
    expect(STANDARD_ORDER_FLOW).not.toContain("WAITING_APPROVAL");
    expect(CUSTOM_ORDER_FLOW).toContain("WAITING_APPROVAL");
  });

  it("both flows start PENDING and end DELIVERED", () => {
    for (const flow of [STANDARD_ORDER_FLOW, CUSTOM_ORDER_FLOW]) {
      expect(flow[0]).toBe("PENDING");
      expect(flow.at(-1)).toBe("DELIVERED");
    }
  });

  it("admin options add CANCELLED and REFUNDED to the flow", () => {
    expect(getAllStatusOptions(false).slice(-2)).toEqual(["CANCELLED", "REFUNDED"]);
    expect(getOrderFlow(true)).toBe(CUSTOM_ORDER_FLOW);
  });

  it("every status in either flow has a customer-facing label", () => {
    for (const s of [...CUSTOM_ORDER_FLOW, "CANCELLED", "REFUNDED"] as const) {
      expect(ORDER_STATUS_LABEL[s]).toBeTruthy();
    }
  });
});

describe("resolveOrderFlow", () => {
  it("uses the matching flow normally", () => {
    expect(resolveOrderFlow("PRODUCTION", false)).toMatchObject({ flow: STANDARD_ORDER_FLOW, index: 2 });
  });

  it("falls back to the other flow rather than stranding the order", () => {
    const r = resolveOrderFlow("DESIGNING", false); // customization-only status on a 'standard' order
    expect(r.flow).toBe(CUSTOM_ORDER_FLOW);
    expect(r.index).toBe(CUSTOM_ORDER_FLOW.indexOf("DESIGNING"));
  });

  it("returns index -1 for terminal statuses outside both flows", () => {
    expect(resolveOrderFlow("CANCELLED", true).index).toBe(-1);
  });
});
