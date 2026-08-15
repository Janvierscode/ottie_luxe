import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({ url: `${SITE_URL}/products/${product.slug}`, lastModified: new Date(product.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
