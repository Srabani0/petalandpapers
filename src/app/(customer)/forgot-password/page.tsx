import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset Your Password" description="We'll email you a code to get back in.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
