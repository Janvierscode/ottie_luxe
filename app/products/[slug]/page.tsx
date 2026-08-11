import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product-details";
import { ProductCard } from "@/components/product-card";
import { formatMoney } from "@/lib/catalogue";
import { getProductBySlug, getProducts } from "@/lib/data";
import { SITE_CONFIG, SITE_URL } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0]?.url || "/assets/ottie-luxe-products.webp";
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { type: "website", title: `${product.name} | Ottie Luxe`, description: product.description, url: `/products/${product.slug}`, images: [{ url: image, alt: product.images[0]?.alt || `${product.name} at Ottie Luxe` }] },
    twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [image] },
  };
}

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();
  const related = allProducts.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.length ? product.images.map((image) => image.url) : [`${SITE_URL}/assets/ottie-luxe-products.webp`],
    url: `${SITE_URL}/products/${product.slug}`,
    sku: product.variants[0]?.sku || product.id,
    brand: { "@type": "Brand", name: SITE_CONFIG.name },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: SITE_CONFIG.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };
  return (
    <main id="main-content">
      <section className="section product-page"><div className="container"><ProductDetails product={product} /></div></section>
      {related.length > 0 && <section className="section related-products"><div className="container"><div className="section-heading section-heading--split"><div><p className="eyebrow">You may also love</p><h2>More from <em>{product.category.name}.</em></h2></div><p>Prices start from {formatMoney(Math.min(...related.map((item) => item.priceCents)))}.</p></div><div className="product-grid product-grid--compact">{related.map((item) => <ProductCard key={item.id} product={item} compact />)}</div></div></section>}
      <Script id={`product-schema-${product.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
