"use client";

import { ImagePlus, MinusCircle, Plus, Save } from "lucide-react";
import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { saveProductAction } from "@/app/admin/actions";
import { formatMoney } from "@/lib/catalogue";
import type { Category, Product, StockStatus } from "@/lib/types";

type OptionDraft = { name: string; values: string };
type VariantDraft = { priceCents: number | null; stockStatus: StockStatus; active: boolean };
const initialState = { ok: false, message: "" };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function combinations(groups: Array<{ name: string; values: string[] }>) {
  if (!groups.length) return [];
  return groups.reduce<Array<Record<string, string>>>((current, group) => {
    if (!current.length) return group.values.map((value) => ({ [group.name]: value }));
    return current.flatMap((entry) => group.values.map((value) => ({ ...entry, [group.name]: value })));
  }, []);
}

export function AdminProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveProductAction, initialState);
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [options, setOptions] = useState<OptionDraft[]>(product?.options.map((option) => ({ name: option.name, values: option.values.join(", ") })) || []);
  const initialOverrides = Object.fromEntries((product?.variants || []).map((variant) => [JSON.stringify(variant.optionValues), { priceCents: variant.priceCents, stockStatus: variant.stockStatus, active: variant.active }]));
  const [overrides, setOverrides] = useState<Record<string, VariantDraft>>(initialOverrides);
  const parsedOptions = useMemo(() => options.map((option) => ({ name: option.name.trim(), values: option.values.split(",").map((value) => value.trim()).filter(Boolean) })).filter((option) => option.name && option.values.length), [options]);
  const combo = useMemo(() => combinations(parsedOptions), [parsedOptions]);
  const variants = combo.map((optionValues) => {
    const key = JSON.stringify(optionValues);
    const existing = overrides[key] || { priceCents: null, stockStatus: product?.stockStatus || "in_stock", active: true };
    return { label: Object.values(optionValues).join(" / "), optionValues, ...existing };
  });

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setOptions((current) => current.map((option, itemIndex) => itemIndex === index ? { ...option, ...patch } : option));
  }
  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setOverrides((current) => ({ ...current, [key]: { ...(current[key] || { priceCents: null, stockStatus: product?.stockStatus || "in_stock", active: true }), ...patch } }));
  }

  return <form action={action} className="admin-form" encType="multipart/form-data">
    {product && <input type="hidden" name="id" value={product.id} />}
    <input type="hidden" name="optionsJson" value={JSON.stringify(parsedOptions)} />
    <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
    <section className="admin-form__section"><div className="admin-form__heading"><div><span>01</span><h2>Product details</h2></div><p>Customer-facing information and pricing.</p></div><div className="admin-field-grid">
      <label className="span-2">Product name<input name="name" value={name} onChange={(event) => { setName(event.target.value); if (!product) setSlug(slugify(event.target.value)); }} minLength={2} maxLength={120} required /></label>
      <label>Product URL<input name="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /><small>ottie-luxe…/products/{slug || "product-name"}</small></label>
      <label>Category<select name="categoryId" defaultValue={product?.categoryId || categories[0]?.id} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="span-2">Short description<textarea name="description" defaultValue={product?.description} rows={2} minLength={10} maxLength={240} required /></label>
      <label className="span-2">Full description<textarea name="longDescription" defaultValue={product?.longDescription} rows={5} minLength={20} maxLength={1200} required /></label>
      <label>Price (USD)<input name="price" type="number" inputMode="decimal" min="0.01" step="0.01" defaultValue={product ? product.priceCents / 100 : ""} required /></label>
      <label>Previous price (optional)<input name="oldPrice" type="number" inputMode="decimal" min="0.01" step="0.01" defaultValue={product?.oldPriceCents ? product.oldPriceCents / 100 : ""} /></label>
      <label>Badge<select name="badge" defaultValue={product?.badge || ""}><option value="">None</option><option>New</option><option>Popular</option><option>Sale</option></select></label>
      <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={product?.sortOrder || 0} /></label>
      <div className="check-row span-2"><label><input name="featured" type="checkbox" defaultChecked={product?.featured} />Featured on home</label><label><input name="isNew" type="checkbox" defaultChecked={product?.isNew} />New arrival</label></div>
    </div></section>
    <section className="admin-form__section"><div className="admin-form__heading"><div><span>02</span><h2>Options & availability</h2></div><button className="button button--soft button--small" type="button" onClick={() => options.length < 2 && setOptions((current) => [...current, { name: "", values: "" }])} disabled={options.length >= 2}><Plus />Add option</button></div><div className="admin-field-grid"><label>Default stock<select name="stockStatus" defaultValue={product?.stockStatus || "in_stock"}><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label><label>Publication<select name="publicationStatus" defaultValue={product?.publicationStatus || "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label></div>
      {options.map((option, index) => <div className="option-builder" key={index}><label>Option name<input value={option.name} onChange={(event) => updateOption(index, { name: event.target.value })} placeholder="Size or Colour" maxLength={40} /></label><label>Values<input value={option.values} onChange={(event) => updateOption(index, { values: event.target.value })} placeholder="Small, Medium, Large" maxLength={500} /><small>Separate up to 10 unique values with commas.</small></label><button className="icon-button icon-button--danger" type="button" onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove option ${index + 1}`}><MinusCircle /></button></div>)}
      {variants.length > 0 && <div className="variant-table"><div className="variant-table__head"><span>Combination</span><span>Price override</span><span>Stock</span><span>Active</span></div>{variants.map((variant) => { const key = JSON.stringify(variant.optionValues); return <div className="variant-table__row" key={key}><strong>{variant.label}</strong><label><span className="sr-only">Price override for {variant.label}</span><input type="number" min="0.01" step="0.01" value={variant.priceCents ? variant.priceCents / 100 : ""} placeholder="Base" onChange={(event) => updateVariant(key, { priceCents: event.target.value ? Math.round(Number(event.target.value) * 100) : null })} /></label><label><span className="sr-only">Stock for {variant.label}</span><select value={variant.stockStatus} onChange={(event) => updateVariant(key, { stockStatus: event.target.value as StockStatus })}><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label><label className="toggle-label"><input type="checkbox" checked={variant.active} onChange={(event) => updateVariant(key, { active: event.target.checked })} /><span>Active</span></label></div>; })}</div>}
    </section>
    <section className="admin-form__section"><div className="admin-form__heading"><div><span>03</span><h2>Product photography</h2></div><p>Up to four JPG, PNG, WebP or AVIF files; maximum 4 MB each.</p></div>
      {product?.images.length ? <div className="admin-image-list">{product.images.map((image) => <div key={image.id}><Image src={image.url} alt={image.alt} width={360} height={360} /><label>Order<input name={`imageOrder:${image.id}`} type="number" min="0" defaultValue={image.sortOrder} /></label><label><input type="radio" name="primaryImageId" value={image.id} defaultChecked={image.primary} />Primary</label><label className="danger-check"><input type="checkbox" name="removeImageIds" value={image.id} />Remove</label></div>)}</div> : <div className="admin-empty-media"><ImagePlus /><p>No real product photos yet. Customers will see the branded “Photo coming soon” visual.</p></div>}
      <div className="admin-upload"><label>Upload new images<input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple /></label><label>Alt text for new images<input name="imageAlt" maxLength={180} placeholder={`Describe ${name || "the product"} accurately`} /><small>Describe what is visible; do not add promotional wording.</small></label></div>
    </section>
    {state.message && <p className={`form-message ${state.ok ? "is-success" : "is-error"}`} role="status">{state.message}</p>}
    <div className="admin-form__actions"><button className="button" type="submit" disabled={pending}><Save />{pending ? "Saving…" : product ? "Save product" : "Create product"}</button>{product && <a className="button button--secondary" href={`/admin/products/${product.id}/preview`} target="_blank" rel="noreferrer">Preview product</a>}</div>
    {product && <p className="fine-print">Current base price: {formatMoney(product.priceCents)}. Archiving preserves the product URL and history.</p>}
  </form>;
}
