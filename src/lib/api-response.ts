import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function zodError(error: ZodError, status = 400) {
  const message = error.issues[0]?.message ?? "Invalid request";
  return NextResponse.json({ error: message, issues: error.issues }, { status });
}
