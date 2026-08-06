import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StockAdjustmentForm } from "@/components/admin/StockAdjustmentForm";
import { getStockAlerts, listInventoryLogs } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Inventory" };

const CHANGE_TYPE_LABEL: Record<string, string> = {
  STOCK_IN: "Stock In",
  STOCK_OUT: "Stock Out",
  ORDER_DEDUCTION: "Order Deduction",
  ADJUSTMENT: "Adjustment",
  RETURN: "Return",
};

const CHANGE_TYPE_VARIANT: Record<string, "success" | "error" | "gold" | "neutral"> = {
  STOCK_IN: "success",
  STOCK_OUT: "error",
  ORDER_DEDUCTION: "gold",
  ADJUSTMENT: "neutral",
  RETURN: "success",
};

export default async function AdminInventoryPage() {
  const [{ outOfStock, lowStock }, logs, products] = await Promise.all([
    getStockAlerts(),
    listInventoryLogs(),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, stock: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Inventory</h1>
      <p className="mt-1 text-sm text-muted">Stock levels, alerts and movement history.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-error/30 bg-error/5 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg text-navy">
            <PackageX className="h-5 w-5 text-error" />
            Out of Stock ({outOfStock.length})
          </h2>
          {outOfStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing out of stock.</p>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-error/20">
              {outOfStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between gap-3 py-2 text-sm hover:text-gold-dark"
                >
                  <span className="text-navy">{p.name}</span>
                  <span className="font-mono text-xs text-muted">{p.sku}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg text-navy">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Low Stock ({lowStock.length})
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing running low.</p>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-warning/20">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between gap-3 py-2 text-sm hover:text-gold-dark"
                >
                  <span className="text-navy">{p.name}</span>
                  <span className="text-muted">
                    {p.stock} left <span className="text-xs">(threshold {p.lowStockThreshold})</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Adjust Stock</h2>
          <div className="mt-4">
            {products.length === 0 ? (
              <p className="text-sm text-muted">No products yet.</p>
            ) : (
              <StockAdjustmentForm products={products} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-5">
          <h2 className="font-display text-lg text-navy">Recent Activity</h2>
          {logs.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No inventory movement yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Change</th>
                    <th className="py-2 pr-3">Reason</th>
                    <th className="py-2 pr-3">By</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 text-navy">{log.product.name}</td>
                      <td className="py-2 pr-3">
                        <Badge variant={CHANGE_TYPE_VARIANT[log.changeType]}>
                          {CHANGE_TYPE_LABEL[log.changeType]}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-navy">
                        {log.quantityChange > 0 ? "+" : ""}
                        {log.quantityChange}
                      </td>
                      <td className="py-2 pr-3 text-muted">{log.reason ?? "—"}</td>
                      <td className="py-2 pr-3 text-muted">{log.performedByUser.name}</td>
                      <td className="py-2 text-muted">{log.createdAt.toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
