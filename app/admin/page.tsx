import Link from "next/link";
import { Archive, Box, CircleAlert, Edit3, Eye, Plus, Tags } from "lucide-react";
import { redirect } from "next/navigation";
import { archiveProductAction, saveCategoryAction, setProductStockAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { formatMoney, stockLabel } from "@/lib/catalogue";
import { getOwnerAccess } from "@/lib/auth";
import { getCategories, getProducts, getPromotions } from "@/lib/data";

export default async function AdminPage() {
  const access = await getOwnerAccess();
  if (access.status === "unconfigured" || access.status === "signed_out") redirect("/admin/login");
  if (access.status === "forbidden") {
    return (
      <main className="admin-auth-page">
        <section className="setup-card">
          <CircleAlert />
          <h1>This account is not the owner.</h1>
          <p>{access.email || "The signed-in account"} is authenticated but is not listed as an active Ottie Luxe administrator.</p>
          <form action="/auth/signout" method="post"><button className="button" type="submit">Sign out</button></form>
        </section>
      </main>
    );
  }

  const [products, categories, promotions] = await Promise.all([
    getProducts(true),
    getCategories(true),
    getPromotions(true),
  ]);
  const published = products.filter((item) => item.publicationStatus === "published").length;
  const low = products.filter((item) => item.stockStatus !== "in_stock").length;

  return (
    <AdminShell email={access.email}>
      <main className="admin-content">
        <div className="admin-title">
          <div><p className="eyebrow">Owner studio</p><h1>Catalogue overview</h1><p>Manage what customers see and keep availability clear.</p></div>
          <Link className="button" href="/admin/products/new"><Plus />Add product</Link>
        </div>
        <div className="admin-stats">
          <article><Box /><span><strong>{products.length}</strong>Total products</span></article>
          <article><Eye /><span><strong>{published}</strong>Published</span></article>
          <article><CircleAlert /><span><strong>{low}</strong>Need stock attention</span></article>
          <article><Tags /><span><strong>{promotions.length}</strong>Promotions</span></article>
        </div>
        <section className="admin-panel">
          <div className="admin-panel__heading"><div><h2>Products</h2><p>Quickly update availability or open the full editor.</p></div></div>
          {products.length ? (
            <div className="admin-product-list">
              {products.map((product) => (
                <article key={product.id}>
                  <div>
                    <span className={`status-dot status-dot--${product.publicationStatus}`} /> <small>{product.publicationStatus}</small>
                    <h3>{product.name}</h3><p>{product.category.name} · {formatMoney(product.priceCents)}</p>
                  </div>
                  <form action={setProductStockAction} className="quick-stock">
                    <input type="hidden" name="id" value={product.id} />
                    <label><span className="sr-only">Stock for {product.name}</span><select name="stockStatus" defaultValue={product.stockStatus}><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label>
                    <button type="submit">Update</button>
                  </form>
                  <div className="admin-list-actions">
                    <Link href={`/admin/products/${product.id}/preview`} target="_blank" aria-label={`Preview ${product.name}`}><Eye /></Link>
                    <Link href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}><Edit3 /></Link>
                    {product.publicationStatus !== "archived" && (
                      <details className="archive-confirm">
                        <summary aria-label={`Archive ${product.name}`}><Archive /></summary>
                        <form action={archiveProductAction}><input type="hidden" name="id" value={product.id} /><span>Hide this product?</span><button type="submit">Confirm archive</button></form>
                      </details>
                    )}
                  </div>
                  <small className="admin-stock-label">{stockLabel(product.stockStatus)}</small>
                </article>
              ))}
            </div>
          ) : <div className="empty-state empty-state--inline"><Box /><h3>No products yet</h3><p>Create the first product to begin the live catalogue.</p></div>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel__heading"><div><h2>Categories</h2><p>Add a collection category without editing code.</p></div></div>
          <div className="category-admin-list">{categories.map((category) => <span key={category.id}>{category.name}</span>)}</div>
          <form action={saveCategoryAction} className="category-quick-form">
            <label>Name<input name="name" required /></label>
            <label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
            <label className="span-2">Description<input name="description" minLength={5} required /></label>
            <label>Order<input name="sortOrder" type="number" min="0" defaultValue={categories.length + 1} /></label>
            <button className="button button--soft" type="submit">Add category</button>
          </form>
        </section>
      </main>
    </AdminShell>
  );
}
