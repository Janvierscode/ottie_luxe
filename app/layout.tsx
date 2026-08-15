import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope, Playfair_Display } from "next/font/google";
import { AppChrome } from "@/components/app-chrome";
import { CartProvider } from "@/components/cart-provider";
import { getProducts } from "@/lib/data";
import { SITE_CONFIG, SITE_URL } from "@/lib/site-config";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ottie Luxe | Jewellery, Perfumes & Gifts in Zimbabwe", template: "%s | Ottie Luxe" },
  description: "Discover affordable jewellery, perfumes, fragrances and gift sets from Ottie Luxe in Zimbabwe. Browse, build your basket and enquire on WhatsApp.",
  keywords: ["jewellery Zimbabwe", "perfumes Zimbabwe", "fragrances", "fashion accessories", "gift sets", "Ottie Luxe"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_ZW",
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [{ url: "/assets/ottie-luxe-products.webp", width: 1200, height: 800, alt: "Ottie Luxe jewellery and fragrance collection" }],
  },
  twitter: { card: "summary_large_image", title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`, description: SITE_CONFIG.description, images: ["/assets/ottie-luxe-products.webp"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#5b1939", colorScheme: "light" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const products = await getProducts();
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_URL,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phoneDisplay,
    areaServed: "Zimbabwe",
    sameAs: [SITE_CONFIG.instagramUrl, SITE_CONFIG.tiktokUrl, SITE_CONFIG.facebookUrl],
  };

  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        <CartProvider products={products}>
          <AppChrome>{children}</AppChrome>
        </CartProvider>
        <Script id="ottie-store-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema).replace(/</g, "\\u003c") }} />
        {umamiUrl && umamiId && <Script src={umamiUrl} data-website-id={umamiId} strategy="lazyOnload" />}
      </body>
    </html>
  );
}
