import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { listCustomers } from "@/lib/customers";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Customers</h1>
      <p className="mt-1 text-sm text-muted">{customers.length} registered customer(s).</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-paper">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-muted">No customers have registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-cream-dark text-left text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Total Spent</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-navy hover:text-gold-dark hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{customer.email}</td>
                    <td className="px-5 py-3 text-muted">
                      {customer.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-muted">{customer.orderCount}</td>
                    <td className="px-5 py-3 text-muted">₹{customer.totalSpent.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={customer.isVerified ? "success" : "neutral"}>
                          {customer.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        {!customer.isActive ? <Badge variant="error">Locked</Badge> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
