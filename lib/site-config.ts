export const SITE_CONFIG = Object.freeze({
  name: "Ottie Luxe",
  tagline: "Wear the Sparkle. Own the Scent.",
  description:
    "Affordable jewellery, perfumes, fragrances and thoughtful gifts in Zimbabwe.",
  whatsappNumber: "+263785483168",
  phoneDisplay: "+263 78 548 3168",
  email: "ottieluxe@gmail.com",
  instagramUrl: "https://www.instagram.com/ottieluxe",
  instagramHandle: "@ottieluxe",
  tiktokUrl: "https://www.tiktok.com/@ottieluxe?lang=en",
  facebookUrl: "https://www.facebook.com/ottieluxe",
  serviceArea: "Zimbabwe — Harare",
  businessHours: "0700–1800",
  currency: "USD",
  locale: "en-ZW",
  creatorName: "Infinity Aura Technologies",
  creatorUrl: "https://infinityaura.tech/",
  creatorTechnologiesUrl: "https://infinityaura.tech/#home",
});

const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (deploymentHost ? `https://${deploymentHost.replace(/\/$/, "")}` : "http://localhost:3000");

export const WHATSAPP_NUMBER = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
