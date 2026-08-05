import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusFilter } from "@/components/admin/OrderStatusFilter";
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE_VARIANT } from "@/lib/order-status";
import { ORDER_STATUS_VALUES } from "@/lib/validations/order";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { status: rawStatus } = await searchParams;
  const statusParam = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const status = ORDER_STATUS_VALUES.includes(statusParam as (typeof ORDER_STATUS_VALUES)[number])
    ? (statusParam as (typeof ORDER_STATUS_VALUES)[number])
    : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: { customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy">Orders</h1>
          <p className="mt-1 text-sm text-muted">Track and manage customer orders.</p>
        </div>
        <Suspense fallback={null}>
          <OrderStatusFilter />
        </Suspense>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-paper">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-muted">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-cream-dark text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-navy">{order.orderNumber}</td>
                  <td className="px-5 py-3">
                    <p className="text-navy">{order.customer.name}</p>
                    <p className="text-xs text-muted">{order.customer.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {order.createdAt.toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-navy">₹{Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-gold-dark hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
