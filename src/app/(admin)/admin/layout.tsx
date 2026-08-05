import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-cream-dark">
      <AdminSidebar adminName={session.name} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
