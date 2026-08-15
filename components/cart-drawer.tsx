"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { validateBasketAction } from "@/app/actions/validate-basket";
import { useCart } from "@/components/cart-provider";
import { basketTotal, buildOrderMessage, formatMoney, resolveBasketItems, stockLabel } from "@/lib/catalogue";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site-config";
import type { Fulfilment } from "@/lib/types";

export function CartDrawer() {
  const { items, products, isCartOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const [name, setName] = useState("");
  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const resolvedItems = useMemo(() => resolveBasketItems(items, products), [items, products]);
  const total = basketTotal(resolvedItems);

  useEffect(() => {
    if (!isCartOpen) return;
    triggerRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a, button:not([disabled]), input, select, textarea"));
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [closeCart, isCartOpen]);

  if (!isCartOpen) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Enter your name using 2–80 characters.");
      return;
    }
    const orderWindow = window.open("about:blank", "_blank");
    if (orderWindow) orderWindow.opener = null;
    setChecking(true);
    try {
      const checked = await validateBasketAction(items);
      const issues = [
        ...checked.missing.map((item) => `${item.productId}:${item.variantId || "default"}`),
        ...checked.items.filter((item) => !item.available).map((item) => `${item.productId}:${item.variantId || "default"}`),
      ];
      setValidationIssues(issues);
      if (issues.length) {
        orderWindow?.close();
        setError("Some selections changed or became unavailable. Remove the marked items, then try again.");
        return;
      }
      const available = checked.items.filter((item) => item.available);
      if (!available.length) {
        orderWindow?.close();
        setError("Add at least one available product before continuing.");
        return;
      }
      setError("");
      const message = buildOrderMessage(available, {
        name: trimmedName,
        fulfilment,
        note,
        sourceUrl: `${window.location.origin}/shop`,
      });
      trackEvent("whatsapp_order_click", { items: available.length, fulfilment });
      const whatsappUrl = buildWhatsAppUrl(message);
      if (orderWindow) orderWindow.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;
    } catch {
      orderWindow?.close();
      setError("We couldn’t recheck the catalogue. Please try again, or use the direct WhatsApp button.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="drawer-layer" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeCart();
    }}>
      <aside ref={panelRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="basket-title">
        <header className="cart-drawer__header">
          <div>
            <p className="eyebrow">Your selection</p>
            <h2 id="basket-title">WhatsApp basket</h2>
          </div>
          <button ref={closeRef} className="icon-button" type="button" onClick={closeCart} aria-label="Close basket"><X /></button>
        </header>
        <div className="cart-drawer__content">
          {!resolvedItems.length ? (
            <div className="empty-state">
              <ShoppingBag aria-hidden="true" />
              <h3>Your basket is waiting</h3>
              <p>Add a few favourites, then send everything in one clear WhatsApp enquiry.</p>
              <Link className="button" href="/shop" onClick={closeCart}>Browse the collection</Link>
            </div>
          ) : (
            <>
              <ul className="basket-list">
                {resolvedItems.map((item) => (
                  <li key={`${item.productId}:${item.variantId || "default"}`} className={!item.available || validationIssues.includes(`${item.productId}:${item.variantId || "default"}`) ? "is-unavailable" : ""}>
                    <div className="basket-list__main">
                      <Link href={`/products/${item.product.slug}`} onClick={closeCart}>{item.product.name}</Link>
                      {item.variant && <span>{item.variant.label}</span>}
                      <strong>{formatMoney(item.unitPriceCents * item.quantity)}</strong>
                      {(!item.available || validationIssues.includes(`${item.productId}:${item.variantId || "default"}`)) && <span className="field-error">This selection changed or is unavailable and will not be sent.</span>}
                    </div>
                    <div className="basket-list__actions">
                      <div className="quantity-control" aria-label={`Quantity for ${item.product.name}`}>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} aria-label="Decrease quantity"><Minus /></button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} aria-label="Increase quantity"><Plus /></button>
                      </div>
                      <button className="icon-button icon-button--danger" type="button" onClick={() => removeItem(item.productId, item.variantId)} aria-label={`Remove ${item.product.name}`}><Trash2 /></button>
                    </div>
                    <small>{stockLabel(item.variant?.stockStatus ?? item.product.stockStatus)}</small>
                  </li>
                ))}
              </ul>
              <div className="basket-summary">
                <span>Estimated total</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <p className="fine-print">Availability, final pricing, payment and arrangements are confirmed in WhatsApp.</p>
              <form className="order-form" onSubmit={submit} noValidate>
                <div className="field">
                  <label htmlFor="order-name">Your name <span aria-hidden="true">*</span></label>
                  <input id="order-name" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={80} required />
                </div>
                <fieldset>
                  <legend>How would you like to receive it?</legend>
                  <div className="choice-row">
                    {(["delivery", "collection"] as Fulfilment[]).map((value) => (
                      <label key={value} className={fulfilment === value ? "is-selected" : ""}>
                        <input type="radio" name="fulfilment" value={value} checked={fulfilment === value} onChange={() => setFulfilment(value)} />
                        {value === "delivery" ? "Delivery" : "Collection"}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="field">
                  <label htmlFor="order-note">Optional note</label>
                  <textarea id="order-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} rows={3} placeholder="Preferred colour, gift message or anything else" />
                  <small>{note.length}/300</small>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button button--whatsapp button--full" type="submit" disabled={checking}>{checking ? "Checking availability…" : "Send order enquiry on WhatsApp"}</button>
              </form>
              <button className="text-button text-button--danger" type="button" onClick={clearCart}>Clear basket</button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
