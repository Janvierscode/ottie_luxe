"use client";

import { Save } from "lucide-react";
import { useActionState, useState } from "react";
import { savePromotionAction } from "@/app/admin/actions";
import type { Product, Promotion } from "@/lib/types";

const HARARE_OFFSET_MS = 2 * 60 * 60 * 1000;

function toHarareInput(value: string | null | undefined) {
  if (!value) return "";
  return new Date(new Date(value).getTime() + HARARE_OFFSET_MS).toISOString().slice(0, 16);
}

function harareInputToIso(value: string) {
  return value ? new Date(`${value}:00+02:00`).toISOString() : "";
}

export function AdminPromotionForm({ promotion, products }: { promotion?: Promotion; products: Product[] }) {
  const [state, action, pending] = useActionState(savePromotionAction, { ok: false, message: "" });
  const [startsAt, setStartsAt] = useState(toHarareInput(promotion?.startsAt));
  const [endsAt, setEndsAt] = useState(toHarareInput(promotion?.endsAt));

  return (
    <form action={action} className="admin-form admin-form--compact">
      {promotion && <input type="hidden" name="id" value={promotion.id} />}
      <input type="hidden" name="startsAt" value={harareInputToIso(startsAt)} />
      <input type="hidden" name="endsAt" value={harareInputToIso(endsAt)} />
      <div className="admin-field-grid">
        <label>Title<input name="title" defaultValue={promotion?.title} required /></label>
        <label>URL slug<input name="slug" defaultValue={promotion?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
        <label className="span-2">Subtitle<input name="subtitle" defaultValue={promotion?.subtitle} required /></label>
        <label className="span-2">Description<textarea name="description" defaultValue={promotion?.description} rows={3} required /></label>
        <label className="span-2">Price or CTA label<input name="priceLabel" defaultValue={promotion?.priceLabel} required /></label>
        <label>Starts (Harare time, optional)<input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
        <label>Ends (Harare time, optional)<input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></label>
        <label>Status<select name="status" defaultValue={promotion?.publicationStatus || "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={promotion?.sortOrder || 0} /></label>
        <fieldset className="span-2 product-checklist"><legend>Linked products</legend>{products.map((product) => <label key={product.id}><input type="checkbox" name="productIds" value={product.id} defaultChecked={promotion?.productIds.includes(product.id)} />{product.name}</label>)}</fieldset>
      </div>
      {state.message && <p className={`form-message ${state.ok ? "is-success" : "is-error"}`}>{state.message}</p>}
      <button className="button" type="submit" disabled={pending}><Save />{pending ? "Saving…" : "Save promotion"}</button>
    </form>
  );
}
