import Link from "next/link";
import { ExternalLink, LogOut, Package, Sparkles, Tags } from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  return <div className="admin-layout"><aside className="admin-sidebar"><Link className="brand" href="/admin"><span className="brand__mark">OL</span><span className="brand__text">Ottie <em>Luxe</em></span></Link><nav aria-label="Dashboard navigation"><Link href="/admin"><Package />Products</Link><Link href="/admin/promotions"><Tags />Promotions</Link><Link href="/" target="_blank"><ExternalLink />View website</Link></nav><div className="admin-sidebar__account"><small>Signed in as</small><strong>{email || "Owner"}</strong><form action={signOutAction}><button type="submit"><LogOut />Sign out</button></form></div></aside><div className="admin-main"><header className="admin-mobile-header"><Link className="brand" href="/admin"><span className="brand__mark">OL</span><span>Owner studio</span></Link><Sparkles /></header><nav className="admin-mobile-nav" aria-label="Owner studio navigation"><Link href="/admin"><Package />Products</Link><Link href="/admin/promotions"><Tags />Offers</Link><Link href="/" target="_blank"><ExternalLink />Website</Link></nav>{children}</div></div>;
}
