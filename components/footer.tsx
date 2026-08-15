import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { SITE_CONFIG, WHATSAPP_NUMBER } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link className="brand brand--light" href="/">
            <span className="brand__mark" aria-hidden="true">OL</span>
            <span className="brand__text">Ottie <em>Luxe</em></span>
          </Link>
          <p>{SITE_CONFIG.tagline}</p>
          <div className="social-row" aria-label="Social media links">
            <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noreferrer" aria-label="Ottie Luxe on Instagram"><Instagram /></a>
            <a href={SITE_CONFIG.tiktokUrl} target="_blank" rel="noreferrer" aria-label="Ottie Luxe on TikTok"><Send /></a>
            <a href={SITE_CONFIG.facebookUrl} target="_blank" rel="noreferrer" aria-label="Ottie Luxe on Facebook"><Facebook /></a>
          </div>
        </div>
        <div>
          <h2>Explore</h2>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/shop">Shop collection</Link>
            <Link href="/shop?category=perfumes">Perfumes</Link>
            <Link href="/shop?category=jewellery">Jewellery</Link>
            <Link href="/#offers">Offers</Link>
            <Link href="/#about">Our story</Link>
          </nav>
        </div>
        <div>
          <h2>Contact</h2>
          <div className="footer-links">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><Phone /> WhatsApp {SITE_CONFIG.phoneDisplay}</a>
            <a href={`mailto:${SITE_CONFIG.email}`}><Mail /> {SITE_CONFIG.email}</a>
            <span><MapPin /> {SITE_CONFIG.serviceArea}</span>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} Ottie Luxe. All rights reserved.</p>
        <p>Created by <a href={SITE_CONFIG.creatorUrl} target="_blank" rel="noreferrer">Infinity Aura</a> <a href={SITE_CONFIG.creatorTechnologiesUrl} target="_blank" rel="noreferrer">Technologies</a></p>
      </div>
    </footer>
  );
}
