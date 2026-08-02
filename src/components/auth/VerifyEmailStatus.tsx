"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

type Status = "verifying" | "success" | "error";

const MISSING_TOKEN_MESSAGE = "This verification link is missing its token.";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [message, setMessage] = useState(token ? "Verifying your email…" : MISSING_TOKEN_MESSAGE);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (cancelled) return;
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message ?? "Email verified.");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("Couldn't reach the server. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {status === "verifying" && <Loader2 className="h-10 w-10 animate-spin text-gold-dark" />}
      {status === "success" && <CheckCircle2 className="h-10 w-10 text-success" />}
      {status === "error" && <XCircle className="h-10 w-10 text-error" />}

      <p className="text-sm text-navy">{message}</p>

      {status !== "verifying" && (
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Go to Sign In
        </Link>
      )}
    </div>
  );
}
