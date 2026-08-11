import type { Metadata } from "next";
import { ShopClient } from "@/components/shop-client";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop Jewellery, Perfumes & Gift Sets",
  description: "Browse Ottie Luxe perfumes, earrings, necklaces, bracelets, rings and gift sets. Build your basket and enquire on WhatsApp.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category = "all" }, products, categories] = await Promise.all([searchParams, getProducts(), getCategories()]);
  return (
    <main id="main-content">
      <section className="page-hero page-hero--shop"><div className="container"><p className="eyebrow">The Ottie Luxe edit</p><h1>Find your <em>kind of luxe.</em></h1><p>Search, filter and explore every available fragrance, accessory and gift set.</p></div></section>
      <section className="section shop-page"><div className="container"><ShopClient products={products} categories={categories} initialCategory={category} /></div></section>
    </main>
  );
}
