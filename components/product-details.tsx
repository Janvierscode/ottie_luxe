"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Share2, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductPlaceholder } from "@/components/product-placeholder";
import { formatMoney, getVariantPrice, stockLabel } from "@/lib/catalogue";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site-config";
import type { Product } from "@/lib/types";

export function ProductDetails({ product, preview = false }: { product: Product; preview?: boolean }) {
  const { addItem, openCart, favourites, toggleFavourite } = useCart();
  const [variantId, setVariantId] = useState(product.variants.length === 1 ? product.variants[0].id : "");
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const variant = useMemo(() => product.variants.find((item) => item.id === variantId) || null, [product.variants, variantId]);
  const stock = variant?.stockStatus ?? product.stockStatus;
  const price = getVariantPrice(product, variant);
  const favourite = favourites.includes(product.id);
  const images = product.images;

  useEffect(() => {
    if (!preview) trackEvent("product_interest", { product: product.slug });
  }, [preview, product.slug]);

  function add() {
    const result = addItem(product.id, variant?.id || null);
    setMessage(result.ok ? "Added to your basket." : result.reason || "Unable to add this item.");
    if (result.ok) window.setTimeout(openCart, 150);
  }

  async function share() {
    const url = `${window.location.origin}/products/${product.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Product link copied.");
      }
    } catch {
      // The native share sheet can be cancelled without an error message.
    }
  }

  const restockMessage = `Hi Ottie Luxe, I’m interested in the ${product.name}${variant ? ` (${variant.label})` : ""}. Could you let me know when it is available?`;

  return (
    <div className="product-detail-grid">
      <section className="product-gallery" aria-label={`${product.name} gallery`}>
        <div className="product-gallery__main">
          {images[activeImage] ? (
            <Image src={images[activeImage].url} alt={images[activeImage].alt} fill priority sizes="(max-width: 900px) 100vw, 50vw" />
          ) : (
            <ProductPlaceholder category={product.category.slug} />
          )}
        </div>
        {images.length > 1 && (
          <div className="thumbnail-row">
            {images.map((image, index) => (
              <button key={image.id} className={activeImage === index ? "is-active" : ""} type="button" onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`}>
                <Image src={image.url} alt="" fill sizes="72px" />
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="product-info">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span aria-current="page">{product.name}</span>
        </nav>
        <p className="eyebrow">{product.category.name}</p>
        <h1>{product.name}</h1>
        <div className="product-info__rating"><span className={`stock stock--${stock}`}>{stockLabel(stock)}</span>{product.badge && <span className="badge badge--inline">{product.badge}</span>}</div>
        <div className="product-info__price"><strong>{formatMoney(price)}</strong>{product.oldPriceCents && !variant?.priceCents && <del>{formatMoney(product.oldPriceCents)}</del>}</div>
        <p className="product-info__lead">{product.longDescription}</p>
        {product.options.length > 0 && (
          <fieldset className="variant-fieldset">
            <legend>Choose {product.options.map((option) => option.name).join(" / ")} <span aria-hidden="true">*</span></legend>
            <div className="variant-grid">
              {product.variants.map((item) => (
                <label key={item.id} className={`${variantId === item.id ? "is-selected" : ""} ${item.stockStatus === "out_of_stock" ? "is-disabled" : ""}`}>
                  <input type="radio" name="product-variant" value={item.id} checked={variantId === item.id} onChange={() => setVariantId(item.id)} disabled={item.stockStatus === "out_of_stock"} />
                  <span>{item.label}</span>
                  {item.priceCents && <small>{formatMoney(item.priceCents)}</small>}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {preview ? <div className="preview-notice" role="status">Preview mode — ordering and sharing controls are hidden until you return to the editor.</div> : <div className="product-actions">
          {stock === "out_of_stock" ? (
            <a className="button button--whatsapp button--full" href={buildWhatsAppUrl(restockMessage)} target="_blank" rel="noreferrer">Ask about restock</a>
          ) : (
            <button className="button button--full" type="button" onClick={add}><ShoppingBag aria-hidden="true" /> Add to basket</button>
          )}
          <button className={`icon-button icon-button--label ${favourite ? "is-favourite" : ""}`} type="button" onClick={() => toggleFavourite(product.id)} aria-pressed={favourite}><Heart fill={favourite ? "currentColor" : "none"} /> {favourite ? "Saved" : "Save"}</button>
          <button className="icon-button icon-button--label" type="button" onClick={share}><Share2 /> Share</button>
        </div>}
        <p className="action-feedback" aria-live="polite">{message}</p>
        <ul className="product-assurance">
          <li><Check /> Easy WhatsApp ordering</li>
          <li><Check /> Availability confirmed personally</li>
          <li><Check /> Gift-ready options available</li>
        </ul>
      </section>
    </div>
  );
}
