import { CategoryIcon } from "@/lib/category-icons";
import type { ItemType } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Gerçek fotoğrafı olmayan kayıtlar için üretilmiş kapak.
 *
 * Neden ikon yerine bu: her kartta aynı düz ikonu göstermek listeyi tek renk
 * bir duvara çeviriyor ve kayıtlar birbirinden ayırt edilemiyor. Kapak, kaydın
 * slug'ından deterministik olarak üretilir — aynı kayıt her zaman aynı kapağı
 * alır, böylece kullanıcı listeyi ikinci kez gördüğünde tanır.
 *
 * Telif riski yok, ağ isteği yok, düzen kayması yok. Gerçek fotoğraf eklendiği
 * anda devreden çıkar (bkz. ItemImage).
 */

/** Slug'dan sabit bir sayı — sunucu ve istemcide aynı sonucu verir. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Tipe göre ton aralığı: ürün mavi-mor, hizmet yeşil-turkuaz, mekân amber-turuncu. */
const TON_ARALIGI: Record<ItemType, [number, number]> = {
  urun: [222, 268],
  hizmet: [150, 190],
  mekan: [24, 46],
};

export function CoverArt({
  slug,
  type,
  categorySlug,
  className,
  iconSize = 40,
}: {
  slug: string;
  type: ItemType;
  categorySlug: string;
  className?: string;
  iconSize?: number;
}) {
  const h = hash(slug);
  const [minTon, maxTon] = TON_ARALIGI[type];
  const ton = minTon + (h % (maxTon - minTon));
  const ton2 = minTon + ((h >> 7) % (maxTon - minTon));
  const aci = 20 + ((h >> 3) % 50);
  // Desen üç varyanttan biri; aynı kategoride ardışık kartlar birbirine benzemesin.
  const desen = (h >> 11) % 3;

  /**
   * Desen kimliği slug'dan değil hash'ten üretilir. Slug'ı temizlemek
   * ("çok-özel" -> "okzel") Türkçe harfleri attığı için farklı iki slug aynı
   * kimliği üretebiliyordu; aynı sayfadaki iki kart o zaman `url(#id)` ile ilk
   * tanıma bağlanıp aynı deseni paylaşırdı.
   */
  const desenId = `p-${h.toString(36)}`;

  return (
    <div className={cn("relative overflow-hidden", className)} aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 120 60"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <linearGradient id={`${desenId}-g`} gradientTransform={`rotate(${aci})`}>
            <stop offset="0%" stopColor={`hsl(${ton} 72% 62%)`} />
            <stop offset="100%" stopColor={`hsl(${ton2} 66% 46%)`} />
          </linearGradient>

          {desen === 0 && (
            <pattern id={desenId} width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" opacity="0.18" />
            </pattern>
          )}
          {desen === 1 && (
            <pattern id={desenId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="1.2" opacity="0.15" />
            </pattern>
          )}
          {desen === 2 && (
            <pattern id={desenId} width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M0 12 L12 0" stroke="white" strokeWidth="1.4" opacity="0.14" />
              <path d="M-3 3 L3 -3" stroke="white" strokeWidth="1.4" opacity="0.14" />
            </pattern>
          )}
        </defs>

        <rect width="120" height="60" fill={`url(#${desenId}-g)`} />
        <rect width="120" height="60" fill={`url(#${desenId})`} />
        {/* Yumuşak ışık: düz gradyanı derinleştirir, ikonun arkasını sakinleştirir. */}
        <ellipse cx="60" cy="26" rx="46" ry="26" fill="white" opacity="0.12" />
      </svg>

      <span className="relative flex h-full items-center justify-center text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.28)]">
        <CategoryIcon slug={categorySlug} size={iconSize} strokeWidth={1.5} />
      </span>
    </div>
  );
}
