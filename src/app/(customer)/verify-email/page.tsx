import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyEmailStatus } from "@/components/auth/VerifyEmailStatus";

export const metadata: Metadata = { title: "Verify Email" };

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Email Verification">
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthCard>
  );
}
