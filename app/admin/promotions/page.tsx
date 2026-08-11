import { redirect } from "next/navigation";
import { AdminPromotionForm } from "@/components/admin-promotion-form";
import { AdminShell } from "@/components/admin-shell";
import { getOwnerAccess } from "@/lib/auth";
import { getProducts, getPromotions } from "@/lib/data";

export default async function PromotionsPage() {
  const access = await getOwnerAccess();
  if (access.status !== "owner") redirect("/admin/login");
  const [promotions, products] = await Promise.all([getPromotions(true), getProducts(true)]);
  return <AdminShell email={access.email}><main className="admin-content"><div className="admin-title"><div><p className="eyebrow">Merchandising</p><h1>Promotions & bundles</h1><p>Schedule offers and connect them to the products customers can explore.</p></div></div><div className="promotion-admin-grid"><section className="admin-panel"><h2>Create promotion</h2><AdminPromotionForm products={products} /></section>{promotions.map((promotion) => <details className="admin-panel" key={promotion.id}><summary><span><small>{promotion.publicationStatus}</small><strong>{promotion.title}</strong></span><span>Edit</span></summary><AdminPromotionForm promotion={promotion} products={products} /></details>)}</div></main></AdminShell>;
}
