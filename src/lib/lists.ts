import type { BadgeKey, Item, ListDef } from "./types";

/**
 * Yaşayan listeler. Sabit "2026'nın en iyileri" yazıp bırakmak yerine
 * listeler her okumada sinyallerden yeniden üretilir — böylece çürümezler.
 */
interface LivingList {
  slug: string;
  title: string;
  description: string;
  /** Kaydı listeye alma koşulu */
  match: (i: Item) => boolean;
  /** Sıralama ölçütü (büyükten küçüğe) */
  rank: (i: Item) => number;
  limit?: number;
}

const byBadge = (b: BadgeKey) => (i: Item) => i.badges.includes(b);

export const LIVING_LISTS: LivingList[] = [
  {
    slug: "bu-hafta-yukselenler",
    title: "Bu Hafta Yükselenler",
    description:
      "Son 30 günde ilgisi kendi kategorisinde en hızlı artanlar. Liste her gün yeniden hesaplanır; sabit bir seçki değildir.",
    match: byBadge("yukselen"),
    rank: (i) => i.scoreBreakdown.ivme ?? 0,
    limit: 12,
  },
  {
    slug: "kategori-liderleri",
    title: "Kategori Liderleri",
    description: "Her kategorinin birinci sırasındakiler — kendi rakipleriyle kıyaslanarak en üste çıkanlar.",
    match: (i) => i.categoryRank === 1,
    rank: (i) => i.score,
    limit: 12,
  },
  {
    slug: "toplulugun-sectikleri",
    title: "Topluluğun Seçtikleri",
    description:
      "Deneyenlerin en az %85'inin tavsiye ettiği kayıtlar. Burada editör değil, deneyimleyenler konuşuyor.",
    match: byBadge("toplulugun-secimi"),
    rank: (i) => i.scoreBreakdown.topluluk ?? 0,
    limit: 12,
  },
  {
    slug: "yeni-kesifler",
    title: "Yeni Keşifler",
    description: "Yayına gireli sekiz haftadan az olan ve daha şimdiden ilgi toplayan yeni isimler.",
    match: byBadge("yeni-kesif"),
    rank: (i) => i.scoreBreakdown.ivme ?? 0,
    limit: 12,
  },
  {
    slug: "zamana-direnenler",
    title: "Zamana Direnenler",
    description: "Aylardır izleniyor ve sürenin çoğunda kategorisinde üst dilimde kalmayı başaranlar.",
    match: byBadge("zamana-direnen"),
    rank: (i) => i.scoreBreakdown.kalicilik ?? 0,
    limit: 12,
  },
  {
    slug: "hype-tutmayanlar",
    title: "Hype'ı Tutmayanlar",
    description:
      "Çok konuşulan ama deneyenlerin yarısından azının tavsiye ettiği kayıtlar. Bu listeyi yayınlıyoruz çünkü gündemde olmak iyi olmak demek değil.",
    match: byBadge("hype-tutmadi"),
    rank: (i) => i.scoreBreakdown.ilgi ?? 0,
    limit: 12,
  },
];

/** Listeleri mevcut veriden üretir; boş kalanlar gösterilmez. */
export function generateLists(items: Item[]): ListDef[] {
  const now = new Date().toISOString();
  return LIVING_LISTS.map((l) => {
    const eslesen = items
      .filter(l.match)
      .sort((a, b) => l.rank(b) - l.rank(a))
      .slice(0, l.limit ?? 12);
    return {
      id: l.slug,
      slug: l.slug,
      title: l.title,
      description: l.description,
      itemSlugs: eslesen.map((i) => i.slug),
      updatedAt: now,
    };
  }).filter((l) => l.itemSlugs.length > 0);
}
