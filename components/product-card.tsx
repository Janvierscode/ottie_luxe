"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductPlaceholder } from "@/components/product-placeholder";
import { formatMoney, stockLabel } from "@/lib/catalogue";
import type { Product } from "@/lib/types";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { favourites, toggleFavourite, addItem, openCart } = useCart();
  const [feedback, setFeedback] = useState("");
  const favourite = favourites.includes(product.id);
  const primaryImage = product.images.find((image) => image.primary) || product.images[0];
  const out = product.stockStatus === "out_of_stock";

  function quickAdd() {
    const result = addItem(product.id);
    setFeedback(result.ok ? "Added to basket." : result.reason || "Unable to add product.");
    if (result.ok) window.setTimeout(openCart, 120);
  }

  return (
    <article className={`product-card ${compact ? "product-card--compact" : ""}`}>
      <div className="product-card__media">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          {primaryImage ? (
            <Image src={primaryImage.url} alt={primaryImage.alt} fill sizes="(max-width: 430px) 50vw, (max-width: 900px) 33vw, 25vw" />
          ) : (
            <ProductPlaceholder category={product.category.slug} compact={compact} />
          )}
        </Link>
        {product.badge && <span className={`badge badge--${product.badge.toLowerCase()}`}>{product.badge}</span>}
        <button
          className={`favourite-button ${favourite ? "is-favourite" : ""}`}
          type="button"
          onClick={() => toggleFavourite(product.id)}
          aria-label={favourite ? `Remove ${product.name} from favourites` : `Save ${product.name} as a favourite`}
          aria-pressed={favourite}
        >
          <Heart fill={favourite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category.name}</span>
          <span className={`stock stock--${product.stockStatus}`}>{stockLabel(product.stockStatus)}</span>
        </div>
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        {!compact && <p>{product.description}</p>}
        <div className="price-row">
          <strong>{formatMoney(product.priceCents)}</strong>
          {product.oldPriceCents && <del>{formatMoney(product.oldPriceCents)}</del>}
        </div>
        {product.options.length ? (
          <Link className="button button--soft button--full" href={`/products/${product.slug}`}>Choose options</Link>
        ) : (
          <button className="button button--soft button--full" type="button" onClick={quickAdd} disabled={out}>
            <ShoppingBag aria-hidden="true" /> {out ? "Currently unavailable" : "Add to basket"}
          </button>
        )}
        <span className="sr-only" aria-live="polite">{feedback}</span>
      </div>
    </article>
  );
}
