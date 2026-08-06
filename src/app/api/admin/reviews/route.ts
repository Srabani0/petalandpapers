import { NextResponse } from "next/server";
import type { ReviewStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listReviewsForAdmin } from "@/lib/reviews";
import { jsonError } from "@/lib/api-response";

const VALID_STATUSES: ReviewStatus[] = ["PENDING", "APPROVED", "HIDDEN"];

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Unauthorized", 403);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status = VALID_STATUSES.includes(statusParam as ReviewStatus)
    ? (statusParam as ReviewStatus)
    : undefined;

  const reviews = await listReviewsForAdmin(status);
  return NextResponse.json({ reviews });
}
