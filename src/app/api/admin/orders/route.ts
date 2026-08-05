import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ORDER_STATUS_VALUES } from "@/lib/validations/order";
import { jsonError } from "@/lib/api-response";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return jsonError("Unauthorized", 401);

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status = ORDER_STATUS_VALUES.includes(statusParam as (typeof ORDER_STATUS_VALUES)[number])
    ? (statusParam as (typeof ORDER_STATUS_VALUES)[number])
    : undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, pageSize: PAGE_SIZE });
}
