import { scoreAll } from "@/lib/scoring";
import { computeBadges } from "@/lib/badges";
import { generateLists } from "@/lib/lists";
import { REVIEW_CRITERIA } from "@/lib/criteria";
import type { Category, DataBundle, Item, ItemSignals, ItemType, Offer, PricePoint, Review } from "@/lib/types";

// ---- Ham veri tipleri (demo dosyalarında elle yazılır, buradan Item/Review/Offer'a derlenir) ----

export interface RawReview {
  user: string;
  rating: number; // 1-5
  comment: string;
  verified?: boolean;
  daysAgo?: number;
}

export interface RawOffer {
  seller: string;
  sellerRating: number; // 0-10
  price: number;
  inStock?: boolean;
}

/**
 * Demo kaydının trend karakteri. Sinyaller buna göre üretilir; böylece
 * "yükselen", "oturmuş" ve "hype'ı tutmayan" örnekleri arayüzde gerçekten görünür.
 */
export type TrendProfile = "yeni" | "yukselen" | "oturmus" | "hype" | "normal";

export interface RawItem {
  slug: string;
  title: string;
  description: string;
  type: ItemType;
  categorySlug: string;
  brand: string;
  city?: string;
  district?: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  /** Editoryal notlar: editör puanı ve genel kalite vekili buradan türetilir. */
  scoreBreakdown: Record<string, number>;
  whyRecommended: string;
  attrs: Record<string, string>;
  pros: string[];
  cons: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  isSponsored?: boolean;
  updatedDaysAgo?: number;
  reviews: RawReview[];
  offers?: RawOffer[];
}

// ---- Deterministik yardımcılar (aynı veri her derlemede aynı çıkar) ----

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/** Yorum kriter puanları: genel puana yakın, deterministik küçük sapmalarla. */
function criteriaFor(type: ItemType, rating: number, seed: string): Record<string, number> {
  const out: Record<string, number> = {};
  REVIEW_CRITERIA[type].forEach((c, i) => {
    const wobble = (hash(seed + c.key) % 3) - 1; // -1..1
    out[c.key] = Math.max(1, Math.min(5, rating + (i % 2 === 0 ? 0 : wobble)));
  });
  return out;
}

/** Ürünler için ~8 aylık deterministik fiyat geçmişi üretir. */
function historyFor(itemId: string, currentPrice: number): PricePoint[] {
  const points: PricePoint[] = [];
  for (let m = 7; m >= 0; m--) {
    const jitter = ((hash(itemId + m) % 21) - 8) / 100;
    const drift = m * 0.012;
    const price = Math.round((currentPrice * (1 + drift + jitter)) / 10) * 10;
    points.push({ date: daysAgoIso(m * 30), price: m === 0 ? currentPrice : price });
  }
  return points;
}

/**
 * Demo sinyalleri. Gerçek üründe bunlar oy tablosu ve günlük anlık görüntülerden
 * gelir; burada kaydın editoryal kalitesi ve trend profilinden deterministik üretilir.
 */
function synthSignals(raw: RawItem, profile: TrendProfile): ItemSignals {
  const h = hash(raw.slug);
  const notlar = Object.values(raw.scoreBreakdown);
  const kalite = notlar.length ? notlar.reduce((s, v) => s + v, 0) / notlar.length : 70;
  const editor = raw.scoreBreakdown.editorDegerlendirmesi ?? raw.scoreBreakdown.editorKontrolu ?? Math.round(kalite);

  // Önceki dönem ilgisi: kaliteyle ilişkili ama gürültülü
  const interestPrev30 = Math.round(180 + (h % 420) + kalite * 4);

  const buyume =
    profile === "hype"
      ? 3.0 + (h % 80) / 100
      : profile === "yukselen"
        ? 1.8 + (h % 45) / 100
        : profile === "yeni"
          ? 2.1 + (h % 30) / 100
          : profile === "oturmus"
            ? 0.95 + (h % 18) / 100
            : 0.9 + (h % 55) / 100;

  const interest30 = Math.round(interestPrev30 * buyume);

  // Oy hacmi ve olumlu oran
  const toplamOy = Math.round(kalite * 2.2 + (h % 70));
  const olumluOran =
    profile === "hype" ? 0.3 + (h % 12) / 100 : Math.min(0.95, 0.58 + kalite / 320 + ((h % 9) - 4) / 100);

  const deneyimOyu = Math.round(toplamOy * (profile === "hype" ? 0.3 : 0.45));
  const votesUp = Math.round(deneyimOyu * olumluOran);
  const votesDown = deneyimOyu - votesUp;
  const votesInterest = Math.round((toplamOy - deneyimOyu) * (profile === "hype" ? 2.6 : 1));

  const weeksTracked =
    profile === "yeni"
      ? 4 + (h % 5)
      : profile === "yukselen"
        ? 10 + (h % 10)
        : profile === "oturmus"
          ? 40 + (h % 30)
          : 18 + (h % 26);

  const ustDilimOrani =
    profile === "oturmus"
      ? 0.86
      : profile === "hype"
        ? 0.22
        : profile === "yukselen"
          ? 0.52
          : profile === "yeni"
            ? 0.5
            : Math.max(0.2, Math.min(0.75, 0.3 + (kalite - 65) / 90));

  return {
    interest30,
    interestPrev30,
    votesUp,
    votesDown,
    votesInterest,
    weeksTracked,
    weeksTop: Math.round(weeksTracked * ustDilimOrani),
    editor,
  };
}

export function buildBundle(
  categories: Category[],
  rawItems: RawItem[],
  profiles: Record<string, TrendProfile> = {}
): DataBundle {
  const items: Item[] = [];
  const reviews: Review[] = [];
  const offers: Offer[] = [];
  const priceHistory: Record<string, PricePoint[]> = {};

  for (const raw of rawItems) {
    const id = raw.slug;
    const itemReviews: Review[] = raw.reviews.map((r, i) => ({
      id: `${id}-r${i + 1}`,
      itemId: id,
      userName: r.user,
      rating: r.rating,
      criteria: criteriaFor(raw.type, r.rating, `${id}-${i}`),
      comment: r.comment,
      isVerified: r.verified ?? false,
      status: "approved",
      createdAt: daysAgoIso(r.daysAgo ?? 10 + (hash(id + i) % 90)),
    }));
    reviews.push(...itemReviews);

    if (raw.offers) {
      raw.offers.forEach((o, i) => {
        offers.push({
          id: `${id}-o${i + 1}`,
          itemId: id,
          sellerName: o.seller,
          sellerRating: o.sellerRating,
          price: o.price,
          inStock: o.inStock ?? true,
          url: "#",
        });
      });
    }

    if (raw.type === "urun" && raw.price) priceHistory[id] = historyFor(id, raw.price);

    const ratingCount = itemReviews.length;
    const ratingAvg = ratingCount
      ? Math.round((itemReviews.reduce((s, r) => s + r.rating, 0) / ratingCount) * 10) / 10
      : 0;

    items.push({
      id,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      type: raw.type,
      categorySlug: raw.categorySlug,
      brand: raw.brand,
      city: raw.city,
      district: raw.district,
      price: raw.price,
      priceMin: raw.priceMin,
      priceMax: raw.priceMax,
      priceLevel: raw.priceLevel,
      signals: synthSignals(raw, profiles[raw.slug] ?? "normal"),
      score: 0,
      scoreBreakdown: {},
      categoryRank: 0,
      categorySize: 0,
      whyRecommended: raw.whyRecommended,
      attrs: raw.attrs,
      pros: raw.pros,
      cons: raw.cons,
      suitableFor: raw.suitableFor,
      notSuitableFor: raw.notSuitableFor,
      badges: [],
      isSponsored: raw.isSponsored ?? false,
      updatedAt: daysAgoIso(raw.updatedDaysAgo ?? hash(id) % 21),
      ratingAvg,
      ratingCount,
      ownerId: null,
    });
  }

  // Puan ve rozetler kategori kohortu üzerinden hesaplanır
  const scored = scoreAll(items).map((it) => ({ ...it, badges: computeBadges(it) }));

  // Listeler sinyallerden üretilir; sabit liste tanımı yoktur.
  return { categories, items: scored, reviews, offers, priceHistory, lists: generateLists(scored), source: "demo" };
}
