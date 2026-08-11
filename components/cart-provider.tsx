"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

function readStoredArray(key: string): unknown[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readBasket(): BasketItem[] {
  return sanitizeBasket(readStoredArray(BASKET_KEY));
}

function readFavourites(): string[] {
  return [...new Set(readStoredArray(FAVOURITES_KEY).filter((value): value is string => typeof value === "string"))].slice(0, 100);
}

function storeValue(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Browsing remains functional when local storage is blocked or full.
  }
}

export function CartProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readBasket());
    setFavourites(readFavourites());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeValue(BASKET_KEY, items);
  }, [hydrated, items]);

  useEffect(() => {
    if (hydrated) storeValue(FAVOURITES_KEY, favourites);
  }, [favourites, hydrated]);

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
      setItems((current) => {
        const currentIndex = current.findIndex(
          (item) => item.productId === productId && item.variantId === variantId,
        );
        if (currentIndex >= 0) {
          return current.map((item, index) =>
            index === currentIndex
              ? { ...item, quantity: normalizeQuantity(item.quantity + quantity) }
              : item,
          );
        }
        return [...current, { productId, variantId, quantity: normalizeQuantity(quantity) }];
      });
      trackEvent("add_to_basket", { product: product.slug });
      return { ok: true };
    },
    [items, products],
  );

  const removeItem = useCallback((productId: string, variantId: string | null = null) => {
    setItems((current) =>
      current.filter((item) => !(item.productId === productId && item.variantId === variantId)),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      setItems((current) =>
        current.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: normalizeQuantity(quantity) }
            : item,
        ),
      );
    },
    [],
  );

  const toggleFavourite = useCallback((productId: string) => {
    setFavourites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

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
      clearCart: () => setItems([]),
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
