import { prisma } from "@/lib/prisma";
import { REVENUE_STATUSES } from "@/lib/dashboard";

export async function listCustomers() {
  const [customers, orderCounts, spend] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({ by: ["customerId"], _count: { _all: true } }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { totalAmount: true },
    }),
  ]);

  const orderCountById = new Map(orderCounts.map((o) => [o.customerId, o._count._all]));
  const spendById = new Map(spend.map((s) => [s.customerId, Number(s._sum.totalAmount ?? 0)]));

  return customers.map((customer) => ({
    ...customer,
    orderCount: orderCountById.get(customer.id) ?? 0,
    totalSpent: spendById.get(customer.id) ?? 0,
  }));
}

export async function getCustomerDetail(id: string) {
  const customer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) return null;

  const totalSpent = customer.orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return { ...customer, totalSpent };
}

export async function updateCustomerNotes(
  id: string,
  adminNotes: string,
): Promise<{ error: string } | { ok: true }> {
  const customer = await prisma.user.findFirst({ where: { id, role: "CUSTOMER" } });
  if (!customer) return { error: "Customer not found." as const };

  await prisma.user.update({ where: { id }, data: { adminNotes: adminNotes || null } });
  return { ok: true as const };
}
