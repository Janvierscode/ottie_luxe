import { Gem, Gift, Sparkles } from "lucide-react";

export function ProductPlaceholder({ category, compact = false }: { category: string; compact?: boolean }) {
  const isPerfume = category === "perfumes";
  const isGift = category === "gift-sets";
  const Icon = isGift ? Gift : isPerfume ? Sparkles : Gem;

  return (
    <div className={`product-placeholder product-placeholder--${category}`} aria-hidden="true">
      <span className="product-placeholder__halo" />
      <Icon size={compact ? 40 : 56} strokeWidth={1.35} />
      <span>{isPerfume ? "Fragrance" : isGift ? "Gift edit" : "Jewellery"}</span>
      <small>Photo coming soon</small>
    </div>
  );
}
