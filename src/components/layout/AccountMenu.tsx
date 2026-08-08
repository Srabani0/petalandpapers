"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountMenu({
  user,
}: {
  user: { name: string; role: "CUSTOMER" | "ADMIN" } | null;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="relative hidden h-10 w-10 items-center justify-center rounded-md text-navy transition-colors hover:bg-cream-dark hover:text-gold-dark sm:inline-flex"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="hidden items-center gap-1 sm:flex">
      <Link
        href={user.role === "ADMIN" ? "/admin" : "/profile"}
        className="rounded-md px-2 py-1.5 text-sm font-medium text-navy hover:text-gold-dark"
      >
        Hi, {user.name.split(" ")[0]}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Log out"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-md text-navy transition-colors hover:bg-cream-dark hover:text-gold-dark",
          loggingOut && "opacity-50",
        )}
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
