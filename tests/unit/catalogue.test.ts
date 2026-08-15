import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { basketTotal, buildOrderMessage, filterAndSortProducts, formatMoney, normalizeQuantity, resolveBasketItems, sanitizeBasket } from "../../lib/catalogue.ts";
import { seedProducts } from "../../lib/seed-data.ts";

describe("catalogue utilities", () => {
  it("formats USD prices for the configured locale", () => {
    assert.match(formatMoney(1800), /18/);
    assert.match(formatMoney(1850), /18\.50/);
  });

  it("limits quantities to the supported range", () => {
    assert.equal(normalizeQuantity(0), 1);
    assert.equal(normalizeQuantity(12.4), 12);
    assert.equal(normalizeQuantity(99), 20);
  });

  it("sanitises persisted basket data and merges repeated selections", () => {
    const basket = sanitizeBasket([
      { productId: "one", variantId: null, quantity: 2 },
      { productId: "one", variantId: null, quantity: 40 },
      { productId: 2, variantId: null, quantity: 1 },
    ]);
    assert.deepEqual(basket, [{ productId: "one", variantId: null, quantity: 20 }]);
  });

  it("filters the catalogue and sorts by displayed price", () => {
    const perfumes = filterAndSortProducts(seedProducts, { query: "fragrance", category: "perfumes", availability: "all", sort: "price-low" });
    assert.ok(perfumes.length >= 2);
    assert.ok(perfumes.every((product) => product.category.slug === "perfumes"));
    assert.ok(perfumes.every((product, index) => index === 0 || perfumes[index - 1].priceCents <= product.priceCents));
  });

  it("resolves a variant price and calculates a basket total", () => {
    const perfume = seedProducts.find((product) => product.id === "signature-bloom")!;
    const variant = perfume.variants.find((item) => item.label === "50 ml")!;
    const items = resolveBasketItems([{ productId: perfume.id, variantId: variant.id, quantity: 2 }], seedProducts);
    assert.equal(items[0].unitPriceCents, 2400);
    assert.equal(basketTotal(items), 4800);
  });

  it("marks unavailable and stale selections so they are excluded", () => {
    const ring = seedProducts.find((product) => product.id === "stacking-ring")!;
    const out = ring.variants.find((item) => item.stockStatus === "out_of_stock")!;
    const items = resolveBasketItems([
      { productId: ring.id, variantId: out.id, quantity: 1 },
      { productId: "missing", variantId: null, quantity: 1 },
    ], seedProducts);
    assert.equal(items.length, 1);
    assert.equal(items[0].available, false);
    assert.equal(basketTotal(items), 0);
  });

  it("builds one structured message without storing customer details", () => {
    const product = seedProducts.find((item) => item.id === "gold-drop-earrings")!;
    const items = resolveBasketItems([{ productId: product.id, variantId: null, quantity: 2 }], seedProducts);
    const message = buildOrderMessage(items, {
      name: "Tariro",
      fulfilment: "collection",
      note: "Gift packaging please",
      sourceUrl: "https://ottie.example/shop",
    });
    assert.match(message, /Gold-Tone Drop Earrings/);
    assert.match(message, /2 ×/);
    assert.match(message, /Name: Tariro/);
    assert.match(message, /Preference: Collection/);
    assert.match(message, /Gift packaging please/);
    assert.match(message, /https:\/\/ottie\.example\/shop/);
  });
});
