import { Sparkles, Tag } from "lucide-react";

export interface Promotion {
  code: string;
  description: string;
}

export function PromoStrip({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) {
    return (
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs tracking-wide sm:px-6 lg:px-8">
        Handcrafted gifts, made from the heart &middot; Free shipping on orders above &#8377;999
      </p>
    );
  }

  const items = [...promotions, ...promotions];

  return (
    <div className="overflow-hidden py-2">
      <div className="pp-marquee-track flex w-max items-center gap-10">
        {items.map((promo, index) => (
          <div key={`${promo.code}-${index}`} className="flex shrink-0 items-center gap-2 text-xs tracking-wide">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-light" />
            <span className="inline-flex items-center gap-1 rounded-full border border-gold-light/40 bg-gold/10 px-2.5 py-0.5 font-semibold text-gold-light">
              <Tag className="h-3 w-3" />
              {promo.code}
            </span>
            <span className="text-cream/90">{promo.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
