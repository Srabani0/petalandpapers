"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput, Label, FieldError } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const from = searchParams.get("from");
      const destination =
        from ?? (data.user.role === "ADMIN" ? "/admin" : "/");
      router.push(destination);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="mb-0">
            Password
          </Label>
          <Link href="/forgot-password" className="text-xs text-gold-dark underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1.5"
        />
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
        {loading ? "Signing in…" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted">
        New to Petal &amp; Papers?{" "}
        <Link href="/register" className="text-gold-dark underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
