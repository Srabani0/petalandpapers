import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE_VARIANT } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Your Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/orders");

  const orders = await prisma.order.findMany({
    where: { customerId: session.sub },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Section>
      <Container className="max-w-4xl">
        <h1 className="font-display text-3xl text-navy">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="mt-8">
            <ComingSoon
              icon={Package}
              title="No Orders Yet"
              description="Once you place an order, you'll be able to track it here."
            />
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {orders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-paper p-5 transition-colors hover:border-gold/40"
                >
                  <div>
                    <p className="font-display text-navy">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-muted">
                      {order.createdAt.toLocaleDateString("en-IN")} · {itemCount} item
                      {itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-navy">₹{Number(order.totalAmount).toFixed(2)}</span>
                    <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
