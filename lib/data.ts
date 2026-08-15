import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient as createAuthenticatedClient } from "@/lib/supabase/server";
import { seedCategories, seedProducts, seedPromotions } from "@/lib/seed-data";
import type {
  Badge,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductVariant,
  Promotion,
  PublicationStatus,
  StockStatus,
} from "@/lib/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

type ImageRow = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
};

type OptionRow = {
  id: string;
  product_id: string;
  name: string;
  values: string[];
  sort_order: number;
};

type VariantRow = {
  id: string;
  product_id: string;
  label: string;
  option_values: Record<string, string>;
  sku: string | null;
  price_cents: number | null;
  stock_status: StockStatus;
  active: boolean;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  description: string;
  long_description: string | null;
  price_cents: number;
  old_price_cents: number | null;
  badge: Badge;
  featured: boolean;
  is_new: boolean;
  publication_status: PublicationStatus;
  stock_status: StockStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category: CategoryRow;
  images: ImageRow[] | null;
  options: OptionRow[] | null;
  variants: VariantRow[] | null;
};

type PromotionRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price_label: string;
  image_url: string | null;
  product_ids: string[] | null;
  starts_at: string | null;
  ends_at: string | null;
  publication_status: PublicationStatus;
  sort_order: number;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function mapImage(row: ImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    url: row.url,
    alt: row.alt_text,
    sortOrder: row.sort_order,
    primary: row.is_primary,
  };
}

function mapOption(row: OptionRow): ProductOption {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    values: row.values || [],
    sortOrder: row.sort_order,
  };
}

function mapVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    optionValues: row.option_values || {},
    sku: row.sku,
    priceCents: row.price_cents,
    stockStatus: row.stock_status,
    active: row.active,
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    category: mapCategory(row.category),
    description: row.description,
    longDescription: row.long_description || row.description,
    priceCents: row.price_cents,
    oldPriceCents: row.old_price_cents,
    badge: row.badge,
    featured: row.featured,
    isNew: row.is_new,
    publicationStatus: row.publication_status,
    stockStatus: row.stock_status,
    sortOrder: row.sort_order,
    images: (row.images || []).map(mapImage).sort((a, b) => a.sortOrder - b.sortOrder),
    options: (row.options || []).map(mapOption).sort((a, b) => a.sortOrder - b.sortOrder),
    variants: (row.variants || []).map(mapVariant).filter((variant) => variant.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    priceLabel: row.price_label,
    imageUrl: row.image_url,
    productIds: row.product_ids || [],
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    publicationStatus: row.publication_status,
    sortOrder: row.sort_order,
  };
}

const productSelect = `
  id, slug, name, category_id, description, long_description, price_cents,
  old_price_cents, badge, featured, is_new, publication_status, stock_status,
  sort_order, created_at, updated_at,
  category:categories!products_category_id_fkey!inner(*),
  images:product_images(*), options:product_options(*), variants:product_variants(*)
`;

export async function getCategories(includeInactive = false): Promise<Category[]> {
  if (!isSupabaseConfigured()) return seedCategories;
  const supabase = includeInactive ? await createAuthenticatedClient() : createPublicClient();
  let query = supabase!.from("categories").select("*").order("sort_order");
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) {
    console.error("Unable to load categories", error.message);
    return [];
  }
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getProducts(includeUnpublished = false): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return includeUnpublished
      ? seedProducts
      : seedProducts.filter((product) => product.publicationStatus === "published");
  }
  const supabase = includeUnpublished ? await createAuthenticatedClient() : createPublicClient();
  let query = supabase!.from("products").select(productSelect).order("sort_order");
  if (!includeUnpublished) query = query.eq("publication_status", "published");
  const { data, error } = await query;
  if (error) {
    console.error("Unable to load products", error.message);
    return [];
  }
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export const getProductBySlug = cache(async (slug: string, includeUnpublished = false) => {
  if (!isSupabaseConfigured()) {
    const found = seedProducts.find((product) => product.slug === slug) || null;
    return !includeUnpublished && found?.publicationStatus !== "published" ? null : found;
  }
  const supabase = includeUnpublished ? await createAuthenticatedClient() : createPublicClient();
  let query = supabase!.from("products").select(productSelect).eq("slug", slug);
  if (!includeUnpublished) query = query.eq("publication_status", "published");
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as unknown as ProductRow);
});

export async function getPromotions(includeUnpublished = false): Promise<Promotion[]> {
  if (!isSupabaseConfigured()) return seedPromotions;
  const supabase = includeUnpublished ? await createAuthenticatedClient() : createPublicClient();
  let query = supabase!.from("promotions").select("*").order("sort_order");
  if (!includeUnpublished) query = query.eq("publication_status", "published");
  const { data, error } = await query;
  if (error) {
    console.error("Unable to load promotions", error.message);
    return [];
  }
  const now = Date.now();
  return (data as PromotionRow[])
    .map(mapPromotion)
    .filter((promotion) => {
      if (includeUnpublished) return true;
      const afterStart = !promotion.startsAt || new Date(promotion.startsAt).getTime() <= now;
      const beforeEnd = !promotion.endsAt || new Date(promotion.endsAt).getTime() >= now;
      return afterStart && beforeEnd;
    });
}

export function usingSeedCatalogue() {
  return !isSupabaseConfigured();
}
