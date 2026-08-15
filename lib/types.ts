export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type PublicationStatus = "draft" | "published" | "archived";
export type Badge = "New" | "Popular" | "Sale" | null;

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
};

export type ProductOption = {
  id: string;
  productId: string;
  name: string;
  values: string[];
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  productId: string;
  label: string;
  optionValues: Record<string, string>;
  sku: string | null;
  priceCents: number | null;
  stockStatus: StockStatus;
  active: boolean;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  alt: string;
  sortOrder: number;
  primary: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  category: Category;
  description: string;
  longDescription: string;
  priceCents: number;
  oldPriceCents: number | null;
  badge: Badge;
  featured: boolean;
  isNew: boolean;
  publicationStatus: PublicationStatus;
  stockStatus: StockStatus;
  sortOrder: number;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export type Promotion = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  priceLabel: string;
  imageUrl: string | null;
  productIds: string[];
  startsAt: string | null;
  endsAt: string | null;
  publicationStatus: PublicationStatus;
  sortOrder: number;
};

export type BasketItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type Fulfilment = "delivery" | "collection";

export type OrderDetails = {
  name: string;
  fulfilment: Fulfilment;
  note: string;
  sourceUrl?: string;
};

export type ResolvedBasketItem = BasketItem & {
  product: Product;
  variant: ProductVariant | null;
  unitPriceCents: number;
  available: boolean;
};
