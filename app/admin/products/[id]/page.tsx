import { notFound, redirect } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminShell } from "@/components/admin-shell";
import { getOwnerAccess } from "@/lib/auth";
import { getCategories, getProducts } from "@/lib/data";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getOwnerAccess();
  if (access.status !== "owner") redirect("/admin/login");
  const { id } = await params;
  const [products, categories] = await Promise.all([getProducts(true), getCategories(true)]);
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  return <AdminShell email={access.email}><main className="admin-content"><div className="admin-title"><div><p className="eyebrow">Catalogue</p><h1>Edit {product.name}</h1><p>Changes publish immediately when the product status is Published.</p></div></div><AdminProductForm product={product} categories={categories} /></main></AdminShell>;
}
