import type { BadgeVariant } from "@/components/ui/Badge";
import type { BadgeKey, Item } from "./types";

export interface BadgeDef {
  key: BadgeKey;
  label: string;
  /** Koşul kullanıcıya da gösterilir — "elle takıldı" tartışması hiç başlamasın diye. */
  description: string;
  variant: BadgeVariant;
}

export const BADGES: Record<BadgeKey, BadgeDef> = {
  yukselen: {
    key: "yukselen",
    label: "Bu ay yükselen",
    description: "Yükseliş ivmesi kendi kategorisinde ilk %10'da",
    variant: "gold-halo",
  },
  "kategori-lideri": {
    key: "kategori-lideri",
    label: "Kategori lideri",
    description: "Kategorisinde birinci ve en az 4 haftadır üst dilimde",
    variant: "halo",
  },
  "toplulugun-secimi": {
    key: "toplulugun-secimi",
    label: "Topluluğun seçimi",
    description: "Deneyenlerin en az %85'i tavsiye ediyor (en az 30 deneyim oyu)",
    variant: "up",
  },
  "yeni-kesif": {
    key: "yeni-kesif",
    label: "Yeni keşif",
    description: "Yayına gireli 8 haftadan az ve ivmesi üst dilimde",
    variant: "soft",
  },
  "zamana-direnen": {
    key: "zamana-direnen",
    label: "Zamana direnen",
    description: "En az 6 aydır izleniyor ve süresinin %80'inde üst dilimde",
    variant: "default",
  },
  "hype-tutmadi": {
    key: "hype-tutmadi",
    label: "Hype'ı tutmadı",
    description: "Çok konuşuluyor ama deneyenlerin yarısından azı tavsiye ediyor",
    variant: "down",
  },
  sponsorlu: {
    key: "sponsorlu",
    label: "Sponsorlu",
    description: "Bu içerik için görünürlük ücreti alınmıştır; puan ve sıralama etkilenmez",
    variant: "gold-soft",
  },
};

/**
 * Rozetleri koşullardan hesaplar. Elle rozet takılamaz — `sponsorlu` dışında
 * hiçbiri veriden bağımsız verilemez. Koşullar `BADGES[...].description` içinde
 * kullanıcıya da gösterilir.
 */
export function computeBadges(item: Item): BadgeKey[] {
  const out: BadgeKey[] = [];
  const s = item.signals;
  const b = item.scoreBreakdown;

  if (!s) {
    /*
     * Topluluk sinyali yok. Tek istisna: dış sinyal dayanağındaki "yükselen".
     * Rozetin yayımlanmış koşulu "ivme kendi kategorisinde ilk %10'da" — kaynağı
     * oy olmak zorunda değil, arama ilgisindeki artış da bu koşulu karşılar ve
     * kaynağı arayüzde yazıyor.
     *
     * Diğer rozetler dış sinyalden ÜRETİLEMEZ: "Topluluğun seçimi" için deneyim
     * oyu, "Hype'ı tutmadı" için memnuniyetsizlik verisi gerekir. Arama hacmiyle
     * bunları söylemek, topluluk adına konuşmak olur.
     */
    const disRozetler: BadgeKey[] = [];
    if (item.scoreBasis === "dis-sinyal" && (b.disIvme ?? 0) >= 90) disRozetler.push("yukselen");
    if (item.isSponsored) disRozetler.push("sponsorlu");
    return disRozetler;
  }

  const deneyimOyu = s.votesUp + s.votesDown;
  const olumluOran = deneyimOyu > 0 ? s.votesUp / deneyimOyu : null;

  // Kategori lideri: birinci sırada ve istikrarlı
  if (item.categoryRank === 1 && s.weeksTop >= 4) out.push("kategori-lideri");

  // Yükselen: ivme yüzdeliği ilk %10'da
  if ((b.ivme ?? 0) >= 90) out.push("yukselen");

  // Yeni keşif: yeni ama ivmesi yüksek
  if (s.weeksTracked <= 8 && (b.ivme ?? 0) >= 70) out.push("yeni-kesif");

  // Zamana direnen: uzun süredir izleniyor ve üstte kalıyor
  if (s.weeksTracked >= 26 && s.weeksTop / s.weeksTracked >= 0.8) out.push("zamana-direnen");

  // Topluluğun seçimi: yüksek olumlu oran, anlamlı hacim
  if (olumluOran !== null && olumluOran >= 0.85 && deneyimOyu >= 30) out.push("toplulugun-secimi");

  // Hype'ı tutmadı: ilgi yüksek ama deneyim olumsuz
  if ((b.ilgi ?? 0) >= 80 && olumluOran !== null && olumluOran < 0.5 && deneyimOyu >= 10) {
    out.push("hype-tutmadi");
  }

  if (item.isSponsored) out.push("sponsorlu");

  return out;
}
