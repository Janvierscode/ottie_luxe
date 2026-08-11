import { SITE_CONFIG, SITE_URL } from "./site-config.ts";
import type {
  BasketItem,
  OrderDetails,
  Product,
  ProductVariant,
  ResolvedBasketItem,
  StockStatus,
} from "@/lib/types";

export function formatMoney(cents: number) {
  return new Intl.NumberFormat(SITE_CONFIG.locale, {
    style: "currency",
    currency: SITE_CONFIG.currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function stockLabel(status: StockStatus) {
  if (status === "low_stock") return "Low stock";
  if (status === "out_of_stock") return "Out of stock";
  return "In stock";
}

export function getVariantPrice(product: Product, variant: ProductVariant | null) {
  return variant?.priceCents ?? product.priceCents;
}

export function resolveBasketItems(items: BasketItem[], products: Product[]): ResolvedBasketItem[] {
  return items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return [];
    const variant = item.variantId
      ? product.variants.find((candidate) => candidate.id === item.variantId) || null
      : null;
    const status = variant?.stockStatus ?? product.stockStatus;
    return [
      {
        ...item,
        product,
        variant,
        unitPriceCents: getVariantPrice(product, variant),
        available:
          product.publicationStatus === "published" &&
          status !== "out_of_stock" &&
          (!item.variantId || Boolean(variant)),
      },
    ];
  });
}

export function basketTotal(items: ResolvedBasketItem[]) {
  return items
    .filter((item) => item.available)
    .reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
}

export function buildOrderMessage(items: ResolvedBasketItem[], details: OrderDetails) {
  const availableItems = items.filter((item) => item.available);
  const lines = availableItems.map((item, index) => {
    const variant = item.variant ? ` — ${item.variant.label}` : "";
    const lineTotal = item.unitPriceCents * item.quantity;
    return `${index + 1}. ${item.product.name}${variant}\n   ${item.quantity} × ${formatMoney(item.unitPriceCents)} = ${formatMoney(lineTotal)}`;
  });
  const note = details.note.trim() ? `\nNote: ${details.note.trim()}` : "";
  const sourceUrl = (details.sourceUrl || `${SITE_URL}/shop`).replace(/\/$/, "");

  return [
    `Hi ${SITE_CONFIG.name}, I’d like to enquire about this order:`,
    "",
    ...lines,
    "",
    `Estimated total: ${formatMoney(basketTotal(availableItems))}`,
    `Name: ${details.name.trim()}`,
    `Preference: ${details.fulfilment === "delivery" ? "Delivery" : "Collection"}${note}`,
    "",
    "Please confirm availability, final total, payment and arrangements.",
    `From: ${sourceUrl}`,
  ].join("\n");
}

export function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(20, Math.max(1, Math.round(quantity)));
}

export function sanitizeBasket(value: unknown): BasketItem[] {
  if (!Array.isArray(value)) return [];
  const result: BasketItem[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Record<string, unknown>;
    if (typeof item.productId !== "string" || (item.variantId !== null && typeof item.variantId !== "string")) continue;
    const variantId = item.variantId as string | null;
    const existing = result.find((entry) => entry.productId === item.productId && entry.variantId === variantId);
    if (existing) {
      existing.quantity = normalizeQuantity(existing.quantity + Number(item.quantity));
    } else if (result.length < 10) {
      result.push({ productId: item.productId, variantId, quantity: normalizeQuantity(Number(item.quantity)) });
    }
  }
  return result;
}

export type CatalogueSort = "featured" | "newest" | "price-low" | "price-high";

export function filterAndSortProducts(
  products: Product[],
  filters: { query: string; category: string; availability: "all" | StockStatus; sort: CatalogueSort },
) {
  const normalQuery = filters.query.trim().toLowerCase();
  return products
    .filter((product) => {
      const jewellery = ["earrings", "necklaces", "bracelets", "rings"].includes(product.category.slug);
      const matchesCategory = filters.category === "all" || product.category.slug === filters.category || (filters.category === "jewellery" && jewellery);
      const matchesStock = filters.availability === "all" || product.stockStatus === filters.availability;
      const matchesQuery = !normalQuery || `${product.name} ${product.description} ${product.category.name}`.toLowerCase().includes(normalQuery);
      return matchesCategory && matchesStock && matchesQuery;
    })
    .sort((a, b) => {
      if (filters.sort === "price-low") return a.priceCents - b.priceCents;
      if (filters.sort === "price-high") return b.priceCents - a.priceCents;
      if (filters.sort === "newest") return Number(b.isNew) - Number(a.isNew) || a.sortOrder - b.sortOrder;
      return Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder;
    });
}
