"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { trackEvent } from "@/lib/analytics";
import { filterAndSortProducts, type CatalogueSort } from "@/lib/catalogue";
import type { Category, Product, StockStatus } from "@/lib/types";

type Availability = "all" | StockStatus;

export function ShopClient({
  products,
  categories,
  initialCategory = "all",
}: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [availability, setAvailability] = useState<Availability>("all");
  const [sort, setSort] = useState<CatalogueSort>("featured");

  const visible = useMemo(() => {
    return filterAndSortProducts(products, { query, category, availability, sort });
  }, [availability, category, products, query, sort]);

  function chooseCategory(value: string) {
    setCategory(value);
    trackEvent("catalogue_filter", { category: value });
    const url = value === "all" ? "/shop" : `/shop?category=${encodeURIComponent(value)}`;
    window.history.replaceState(null, "", url);
  }

  const filterCategories = [
    { slug: "all", name: "All" },
    { slug: "jewellery", name: "Jewellery" },
    ...categories,
  ].filter((item, index, all) => all.findIndex((candidate) => candidate.slug === item.slug) === index);

  return (
    <div className="catalogue">
      <div className="catalogue-toolbar">
        <label className="search-field">
          <span className="sr-only">Search the collection</span>
          <Search aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search perfume, earrings, gifts…" />
        </label>
        <div className="select-wrap">
          <SlidersHorizontal aria-hidden="true" />
          <label htmlFor="availability">Availability</label>
          <select id="availability" value={availability} onChange={(event) => setAvailability(event.target.value as Availability)}>
            <option value="all">All availability</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
        <div className="select-wrap">
          <label htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(event) => setSort(event.target.value as CatalogueSort)}>
            <option value="featured">Featured first</option>
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="category-scroller" role="group" aria-label="Product categories">
        {filterCategories.map((item) => (
          <button key={item.slug} className={category === item.slug ? "is-active" : ""} type="button" aria-pressed={category === item.slug} onClick={() => chooseCategory(item.slug)}>
            {item.name}
          </button>
        ))}
      </div>
      <p className="catalogue-count" aria-live="polite">{visible.length} {visible.length === 1 ? "product" : "products"}</p>
      {visible.length ? (
        <div className="product-grid">
          {visible.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="empty-state empty-state--inline">
          <Search aria-hidden="true" />
          <h2>No matches yet</h2>
          <p>Try a different search or reset the filters to see the full collection.</p>
          <button className="button button--soft" type="button" onClick={() => { setQuery(""); setCategory("all"); setAvailability("all"); }}>Reset filters</button>
        </div>
      )}
    </div>
  );
}
