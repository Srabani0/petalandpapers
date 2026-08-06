import type { Metadata } from "next";
import Link from "next/link";
import { IndianRupee, ClipboardList, Package, Users, Clock, Factory, CheckCircle2 } from "lucide-react";
import {
  getDashboardKpis,
  getMonthlySales,
  getOrderTrends,
  getTopProducts,
  getCategoryPerformance,
} from "@/lib/dashboard";
import { MonthlySalesChart } from "@/components/admin/charts/MonthlySalesChart";
import { OrderTrendsChart } from "@/components/admin/charts/OrderTrendsChart";
import { TopProductsChart } from "@/components/admin/charts/TopProductsChart";
import { CategoryPerformanceChart } from "@/components/admin/charts/CategoryPerformanceChart";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const [kpis, monthlySales, orderTrends, topProducts, categoryPerformance] = await Promise.all([
    getDashboardKpis(),
    getMonthlySales(),
    getOrderTrends(),
    getTopProducts(),
    getCategoryPerformance(),
  ]);

  const cards = [
    { label: "Revenue", value: `₹${kpis.revenue.toFixed(2)}`, icon: IndianRupee, href: "/admin/orders" },
    { label: "Orders", value: kpis.orders, icon: ClipboardList, href: "/admin/orders" },
    { label: "Products", value: kpis.products, icon: Package, href: "/admin/products" },
    { label: "Customers", value: kpis.customers, icon: Users, href: "/admin/customers" },
    { label: "Pending", value: kpis.pending, icon: Clock, href: "/admin/orders?status=PENDING" },
    { label: "In Production", value: kpis.inProduction, icon: Factory, href: "/admin/orders?status=PRODUCTION" },
    { label: "Delivered", value: kpis.delivered, icon: CheckCircle2, href: "/admin/orders?status=DELIVERED" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A live snapshot of the store.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-border bg-paper p-5 transition-colors hover:border-gold/40"
          >
            <Icon className="h-5 w-5 text-gold-dark" />
            <p className="mt-3 font-display text-2xl text-navy">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Monthly Sales</h2>
          <div className="mt-4">
            <MonthlySalesChart data={monthlySales} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Order Trends (Last 14 Days)</h2>
          <div className="mt-4">
            <OrderTrendsChart data={orderTrends} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Top Products</h2>
          <div className="mt-4">
            {topProducts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No sales yet.</p>
            ) : (
              <TopProductsChart data={topProducts} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Category Performance</h2>
          <div className="mt-4">
            {categoryPerformance.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No sales yet.</p>
            ) : (
              <CategoryPerformanceChart data={categoryPerformance.slice(0, 8)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
