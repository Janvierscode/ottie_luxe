"use server";

import { z } from "zod";
import { resolveBasketItems } from "@/lib/catalogue";
import { getProducts } from "@/lib/data";
import type { BasketItem, ResolvedBasketItem } from "@/lib/types";

const basketItemSchema = z.object({
  productId: z.string().min(1).max(120),
  variantId: z.string().min(1).max(160).nullable(),
  quantity: z.number().int().min(1).max(20),
});

const basketSchema = z.array(basketItemSchema).max(10);

export type BasketCheck = {
  items: ResolvedBasketItem[];
  missing: BasketItem[];
};

export async function validateBasketAction(input: BasketItem[]): Promise<BasketCheck> {
  const basket = basketSchema.parse(input);
  const products = await getProducts();
  const items = resolveBasketItems(basket, products);
  const resolvedKeys = new Set(items.map((item) => `${item.productId}:${item.variantId || "default"}`));
  const missing = basket.filter(
    (item) => !resolvedKeys.has(`${item.productId}:${item.variantId || "default"}`),
  );

  return { items, missing };
}
