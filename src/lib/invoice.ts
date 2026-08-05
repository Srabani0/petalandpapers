import PDFDocument from "pdfkit";
import type { Prisma } from "@prisma/client";

type InvoiceOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;

interface AddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
}

const NAVY = "#1E2A4A";
const MUTED = "#7A756C";
const INK = "#241F1A";
const RULE = "#E4DCC8";

/** Renders a simple A4 invoice PDF for an order. No custom fonts — the ₹ glyph isn't in pdfkit's built-in Helvetica, so amounts use "Rs." instead. */
export function generateInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const address = order.addressSnapshot as unknown as AddressSnapshot;
    const money = (n: number) => `Rs. ${n.toFixed(2)}`;

    doc.fontSize(20).fillColor(NAVY).text("Petal & Papers");
    doc.fontSize(10).fillColor(MUTED).text("Handcrafted gifts, made from the heart");
    doc.moveDown(1.5);

    doc.fontSize(14).fillColor(NAVY).text(`Invoice — Order ${order.orderNumber}`);
    doc.fontSize(10).fillColor(INK).text(`Date: ${order.createdAt.toLocaleDateString("en-IN")}`);
    doc.moveDown();

    doc.fontSize(11).fillColor(NAVY).text("Deliver To");
    doc.fontSize(10).fillColor(INK);
    doc.text(address.fullName);
    doc.text(`${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ""}`);
    doc.text(`${address.city}, ${address.state} - ${address.pincode}`);
    doc.text(address.phone);
    doc.moveDown(1.5);

    const col = { name: 50, qty: 320, price: 380, total: 460 };
    const tableTop = doc.y;
    doc.fontSize(10).fillColor(MUTED);
    doc.text("Item", col.name, tableTop);
    doc.text("Qty", col.qty, tableTop);
    doc.text("Price", col.price, tableTop);
    doc.text("Total", col.total, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor(RULE).stroke();

    let y = tableTop + 22;
    doc.fillColor(INK);
    for (const item of order.items) {
      const snapshot = item.productSnapshot as unknown as { name: string };
      const unitPrice = Number(item.unitPrice);
      doc.fontSize(10);
      doc.text(snapshot.name, col.name, y, { width: 260 });
      doc.text(String(item.quantity), col.qty, y);
      doc.text(money(unitPrice), col.price, y);
      doc.text(money(unitPrice * item.quantity), col.total, y);
      y += 20;
    }

    y += 8;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(RULE).stroke();
    y += 14;

    const rows: Array<[string, number]> = [["Subtotal", Number(order.subtotal)]];
    if (Number(order.discountAmount) > 0) rows.push(["Product Discount", -Number(order.discountAmount)]);
    if (Number(order.couponDiscount) > 0) rows.push(["Coupon Discount", -Number(order.couponDiscount)]);
    rows.push(["Delivery", Number(order.deliveryCharge)]);

    for (const [label, value] of rows) {
      doc.fontSize(10).fillColor(MUTED).text(label, 380, y);
      doc.fillColor(INK).text(money(value), 460, y);
      y += 16;
    }

    y += 4;
    doc.fontSize(12).fillColor(NAVY).text("Total", 380, y);
    doc.text(money(Number(order.totalAmount)), 460, y);

    doc
      .fontSize(8)
      .fillColor(MUTED)
      .text("Thank you for shopping with Petal & Papers.", 50, 780, { align: "center", width: 495 });

    doc.end();
  });
}
