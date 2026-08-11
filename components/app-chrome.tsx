"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { buildWhatsAppUrl } from "@/lib/site-config";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      {children}
      <Footer />
      <CartDrawer />
      <a className="floating-whatsapp" href={buildWhatsAppUrl("Hi Ottie Luxe, I’d like to enquire about your collection.")} target="_blank" rel="noreferrer" aria-label="Enquire with Ottie Luxe on WhatsApp">
        <MessageCircle aria-hidden="true" /><span>WhatsApp</span>
      </a>
    </>
  );
}
