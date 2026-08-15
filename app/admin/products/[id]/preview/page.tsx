import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { ProductDetails } from "@/components/product-details";
import { getOwnerAccess } from "@/lib/auth";
import { getProducts } from "@/lib/data";

export default async function ProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getOwnerAccess();
  if (access.status !== "owner") redirect("/admin/login");
  const { id } = await params;
  const product = (await getProducts(true)).find((item) => item.id === id);
  if (!product) notFound();

  return (
    <main id="main-content" className="admin-preview-page">
      <div className="preview-toolbar">
        <div><p className="eyebrow">Private customer-view preview</p><strong>{product.publicationStatus}</strong></div>
        <Link className="button button--secondary" href={`/admin/products/${product.id}`}><ArrowLeft />Back to editor</Link>
      </div>
      <section className="section product-page"><div className="container"><ProductDetails product={product} preview /></div></section>
    </main>
  );
}
