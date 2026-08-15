import { redirect } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminShell } from "@/components/admin-shell";
import { getOwnerAccess } from "@/lib/auth";
import { getCategories } from "@/lib/data";

export default async function NewProductPage() {
  const access = await getOwnerAccess();
  if (access.status !== "owner") redirect("/admin/login");
  const categories = await getCategories(true);
  return <AdminShell email={access.email}><main className="admin-content"><div className="admin-title"><div><p className="eyebrow">Catalogue</p><h1>Add a new product</h1><p>Start as a draft if the details or photography still need checking.</p></div></div><AdminProductForm categories={categories} /></main></AdminShell>;
}
