"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { SITE_CONFIG } from "@/lib/site-config";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Perfumes", href: "/shop?category=perfumes" },
  { label: "Jewellery", href: "/shop?category=jewellery" },
  { label: "Offers", href: "/#offers" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.setTimeout(() => toggleRef.current?.focus(), 0);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>("a, button:not([disabled])"),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, open]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 960) setOpen(false);
    };
    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  return (
    <>
      <div className="announcement">
        <div className="container announcement__inner">
          <span>Everyday luxury, thoughtfully selected</span>
          <Link href="/#offers">Explore current offers <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link className="brand" href="/" aria-label={`${SITE_CONFIG.name} home`}>
            <span className="brand__mark" aria-hidden="true">OL</span>
            <span className="brand__text">Ottie <em>Luxe</em></span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <Link key={link.label} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="basket-button" type="button" onClick={openCart} aria-label={`Open basket with ${itemCount} items`}>
              <ShoppingBag size={20} aria-hidden="true" />
              <span className="basket-button__label">Basket</span>
              <span className="basket-count" aria-hidden="true">{itemCount}</span>
            </button>
            <button
              ref={toggleRef}
              className="menu-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-menu-layer" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMenu(true);
        }}>
          <div className="mobile-menu" id="mobile-menu" ref={menuRef}>
            <nav aria-label="Mobile navigation">
              {links.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <button className="button button--full" type="button" onClick={() => { setOpen(false); openCart(); }}>
              <ShoppingBag size={18} aria-hidden="true" /> Review your basket
            </button>
          </div>
        </div>
      )}
    </>
  );
}
