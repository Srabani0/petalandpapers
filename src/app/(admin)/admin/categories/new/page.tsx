import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "New Category" };

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-navy">New Category</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
