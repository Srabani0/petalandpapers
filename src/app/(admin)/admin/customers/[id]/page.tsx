import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { CustomerNotes } from "@/components/admin/CustomerNotes";
import { getCustomerDetail } from "@/lib/customers";
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE_VARIANT } from "@/lib/order-status";

export const metadata: Metadata = { title: "Customer Detail" };

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);
  if (!customer) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy">{customer.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {customer.email} · Joined {customer.createdAt.toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Badge variant={customer.isVerified ? "success" : "neutral"}>
            {customer.isVerified ? "Verified" : "Unverified"}
          </Badge>
          {!customer.isActive ? <Badge variant="error">Locked</Badge> : null}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Order History</h2>
            {customer.orders.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No orders yet.</p>
            ) : (
              <div className="mt-4 flex flex-col divide-y divide-border">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-gold-dark"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">{order.orderNumber}</p>
                      <p className="text-xs text-muted">{order.createdAt.toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-navy">₹{Number(order.totalAmount).toFixed(2)}</span>
                      <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Addresses</h2>
            {customer.addresses.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No saved addresses.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-navy">
                      {address.fullName}
                      {address.label ? ` · ${address.label}` : ""}
                      {address.isDefault ? <span className="ml-2 text-xs text-gold-dark">Default</span> : null}
                    </p>
                    <p className="text-muted">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.state}{" "}
                      — {address.pincode}
                    </p>
                    <p className="text-muted">{address.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Summary</h2>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Orders</dt>
                <dd className="text-navy">{customer.orders.length}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Total Spent</dt>
                <dd className="text-navy">₹{customer.totalSpent.toFixed(2)}</dd>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-paper p-5">
            <h2 className="font-display text-lg text-navy">Notes</h2>
            <div className="mt-3">
              <CustomerNotes customerId={customer.id} initialNotes={customer.adminNotes ?? ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
