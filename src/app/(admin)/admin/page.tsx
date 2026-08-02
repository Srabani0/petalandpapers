import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="Admin Dashboard Coming Soon"
      description="Auth and RBAC land in the next phase, followed by the full product, order and customization management panels."
    />
  );
}
