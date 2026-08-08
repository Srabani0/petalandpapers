"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      <LogOut className="h-4 w-4" />
      {loading ? "Logging out…" : "Log Out"}
    </Button>
  );
}
