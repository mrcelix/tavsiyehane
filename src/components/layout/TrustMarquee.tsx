import {
  Award,
  BadgeCheck,
  Clock,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

/**
 * §5 Kat 3 — güven şeridi.
 * 34px sabit, paper @80% + blur, akışta (sticky değil), şerit iki kez klonlanır.
 */
const ITEMS: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }[] = [
  { icon: ShieldCheck, text: "Tavsiye puanı satılmaz" },
  { icon: BadgeCheck, text: "Doğrulanmış yorumlar daha yüksek ağırlıkta" },
  { icon: Scale, text: "Her kategoriye özel puanlama modeli" },
  { icon: Star, text: "39 tavsiye, 9 kategori" },
  { icon: Clock, text: "Son güncelleme tarihi her kayıtta açık" },
  { icon: Sparkles, text: "İhtiyaca göre kişisel öneri" },
  { icon: Users, text: "Kullanıcı deneyimleri moderasyondan geçer" },
  { icon: TrendingUp, text: "Fiyat geçmişi ve stok takibi" },
  { icon: ThumbsUp, text: "Artılar ve eksiler açıkça listelenir" },
  { icon: Award, text: "Sponsorlu içerik ayrı işaretlenir" },
];

function Strip({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center gap-8 pr-8" aria-hidden={ariaHidden}>
      {ITEMS.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="flex shrink-0 items-center gap-2">
            <Icon size={14} className="text-[var(--brand)]" />
            <span className="whitespace-nowrap text-[12.5px] font-semibold text-[var(--ink-2)]">{it.text}</span>
            <span className="ml-6 h-1 w-1 rounded-full bg-[var(--line)]" />
          </div>
        );
      })}
    </div>
  );
}

export function TrustMarquee() {
  return (
    <div className="trust-marquee-shine relative h-[34px] overflow-hidden border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--paper)_80%,transparent)] backdrop-blur-lg">
      <div className="trust-marquee-track flex h-full items-center">
        <Strip />
        <Strip ariaHidden />
      </div>
    </div>
  );
}
