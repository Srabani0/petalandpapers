import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthCard title="Create Your Account" description="Join Petal & Papers to start ordering.">
      <RegisterForm />
    </AuthCard>
  );
}
