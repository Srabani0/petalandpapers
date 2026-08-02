"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput, Label, FieldError, FieldHint } from "@/components/ui/Input";

type Step = "request" | "reset";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("reset");
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="text-sm text-navy">Password reset. Taking you to sign in…</p>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <FieldHint>
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
        </FieldHint>
        <div>
          <Label htmlFor="otp">Reset Code</Label>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>
        <div>
          <Label htmlFor="password">New Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <FieldError>{error ?? undefined}</FieldError>

        <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? "Resetting…" : "Reset Password"}
        </Button>
        <button
          type="button"
          onClick={() => setStep("request")}
          className="text-center text-sm text-muted underline underline-offset-4"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequest} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
        {loading ? "Sending…" : "Send Reset Code"}
      </Button>

      <p className="text-center text-sm text-muted">
        Remembered your password?{" "}
        <Link href="/login" className="text-gold-dark underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
