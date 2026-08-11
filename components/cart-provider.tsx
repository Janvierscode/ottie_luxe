"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { BasketItem, Product } from "@/lib/types";
import { normalizeQuantity, sanitizeBasket } from "@/lib/catalogue";
import { trackEvent } from "@/lib/analytics";

const BASKET_KEY = "ottie-luxe:basket:v1";
const FAVOURITES_KEY = "ottie-luxe:favourites:v1";

type AddResult = { ok: boolean; reason?: string };
type CartContextValue = {
  products: Product[];
  items: BasketItem[];
  favourites: string[];
  isCartOpen: boolean;
  itemCount: number;
  addItem: (productId: string, variantId?: string | null, quantity?: number) => AddResult;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  toggleFavourite: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const fallbackStorage = new Map<string, string>();
const storageListeners = new Map<string, Set<() => void>>();

function readStoredValue(key: string) {
  try {
    return window.localStorage.getItem(key) || fallbackStorage.get(key) || "[]";
  } catch {
    return fallbackStorage.get(key) || "[]";
  }
}

function readStoredArray(raw: string): unknown[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readBasket(raw: string): BasketItem[] {
  return sanitizeBasket(readStoredArray(raw));
}

function readFavourites(raw: string): string[] {
  return [...new Set(readStoredArray(raw).filter((value): value is string => typeof value === "string"))].slice(0, 100);
}

function storeValue(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  fallbackStorage.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Browsing remains functional when local storage is blocked or full.
  }
  storageListeners.get(key)?.forEach((listener) => listener());
}

function subscribeToStorage(key: string, listener: () => void) {
  const listeners = storageListeners.get(key) || new Set<() => void>();
  listeners.add(listener);
  storageListeners.set(key, listeners);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function useStoredValue(key: string) {
  return useSyncExternalStore(
    (listener) => subscribeToStorage(key, listener),
    () => readStoredValue(key),
    () => "[]",
  );
}

export function CartProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const basketValue = useStoredValue(BASKET_KEY);
  const favouritesValue = useStoredValue(FAVOURITES_KEY);
  const items = useMemo(() => readBasket(basketValue), [basketValue]);
  const favourites = useMemo(() => readFavourites(favouritesValue), [favouritesValue]);
  const [isCartOpen, setCartOpen] = useState(false);

  const addItem = useCallback(
    (productId: string, variantId: string | null = null, quantity = 1): AddResult => {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) return { ok: false, reason: "This product is no longer available." };
      if (product.options.length && !variantId) return { ok: false, reason: "Choose an option first." };
      const variant = variantId
        ? product.variants.find((candidate) => candidate.id === variantId)
        : null;
      if (variantId && !variant) return { ok: false, reason: "That option is unavailable." };
      if ((variant?.stockStatus ?? product.stockStatus) === "out_of_stock") {
        return { ok: false, reason: "This selection is currently out of stock." };
      }

      const existingIndex = items.findIndex(
        (item) => item.productId === productId && item.variantId === variantId,
      );
      if (existingIndex === -1 && items.length >= 10) {
        return { ok: false, reason: "Your basket can hold up to 10 different selections." };
      }
      const currentIndex = items.findIndex(
        (item) => item.productId === productId && item.variantId === variantId,
      );
      const nextItems = currentIndex >= 0
        ? items.map((item, index) =>
          index === currentIndex
            ? { ...item, quantity: normalizeQuantity(item.quantity + quantity) }
            : item,
        )
        : [...items, { productId, variantId, quantity: normalizeQuantity(quantity) }];
      storeValue(BASKET_KEY, nextItems);
      trackEvent("add_to_basket", { product: product.slug });
      return { ok: true };
    },
    [items, products],
  );

  const removeItem = useCallback((productId: string, variantId: string | null = null) => {
    storeValue(
      BASKET_KEY,
      items.filter((item) => !(item.productId === productId && item.variantId === variantId)),
    );
  }, [items]);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      storeValue(
        BASKET_KEY,
        items.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: normalizeQuantity(quantity) }
            : item,
        ),
      );
    },
    [items],
  );

  const toggleFavourite = useCallback((productId: string) => {
    storeValue(
      FAVOURITES_KEY,
      favourites.includes(productId)
        ? favourites.filter((id) => id !== productId)
        : [...favourites, productId],
    );
  }, [favourites]);

  const value = useMemo<CartContextValue>(
    () => ({
      products,
      items,
      favourites,
      isCartOpen,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearCart: () => storeValue(BASKET_KEY, []),
      toggleFavourite,
      openCart: () => {
        setCartOpen(true);
        trackEvent("basket_open");
      },
      closeCart: () => setCartOpen(false),
    }),
    [addItem, favourites, isCartOpen, items, products, removeItem, toggleFavourite, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
