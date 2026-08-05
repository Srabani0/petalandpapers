import { createHmac, randomUUID } from "crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  mock: boolean;
}

/** Creates a Razorpay order (amount in rupees, converted to paise). Falls back
 * to a mock order when no Razorpay keys are configured, so checkout is fully
 * testable before the business owner has live/test Razorpay credentials. */
export async function createOrder(amountRupees: number, receipt: string): Promise<RazorpayOrder> {
  if (!isRazorpayConfigured()) {
    return { id: `mock_order_${randomUUID()}`, amount: Math.round(amountRupees * 100), currency: "INR", mock: true };
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(amountRupees * 100),
      currency: "INR",
      receipt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Razorpay order creation failed: ${res.status}`);
  }

  const data = await res.json();
  return { id: data.id, amount: data.amount, currency: data.currency, mock: false };
}

/** HMAC-SHA256 signature verification (NFR-SEC-06). Mock orders (no keys
 * configured) verify a synthetic signature instead, so the checkout flow is
 * end-to-end testable without real Razorpay credentials. */
export function verifySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
) {
  if (!isRazorpayConfigured()) {
    return signature === mockSignature(razorpayOrderId, razorpayPaymentId);
  }

  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expected === signature;
}

export function mockSignature(razorpayOrderId: string, razorpayPaymentId: string) {
  return createHmac("sha256", "mock-secret").update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
}
