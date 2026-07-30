import { computeScore } from "@/lib/scoring";
import { REVIEW_CRITERIA } from "@/lib/criteria";
import type { BadgeKey, Category, DataBundle, Item, ItemType, ListDef, Offer, PricePoint, Review } from "@/lib/types";

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
  scoreBreakdown: Record<string, number>;
  whyRecommended: string;
  attrs: Record<string, string>;
  pros: string[];
  cons: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  badges?: BadgeKey[];
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
    const jitter = ((hash(itemId + m) % 21) - 8) / 100; // -0.08..0.12
    const drift = m * 0.012; // geçmişte hafifçe daha yüksek fiyat eğilimi
    const price = Math.round((currentPrice * (1 + drift + jitter)) / 10) * 10;
    points.push({ date: daysAgoIso(m * 30), price: m === 0 ? currentPrice : price });
  }
  return points;
}

export function buildBundle(categories: Category[], rawItems: RawItem[], rawLists: Omit<ListDef, "id" | "updatedAt">[]): DataBundle {
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
      createdAt: daysAgoIso(r.daysAgo ?? 10 + ((hash(id + i) % 90))),
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

    if (raw.type === "urun" && raw.price) {
      priceHistory[id] = historyFor(id, raw.price);
    }

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
      score: computeScore(raw.type, raw.scoreBreakdown),
      scoreBreakdown: raw.scoreBreakdown,
      whyRecommended: raw.whyRecommended,
      attrs: raw.attrs,
      pros: raw.pros,
      cons: raw.cons,
      suitableFor: raw.suitableFor,
      notSuitableFor: raw.notSuitableFor,
      badges: [...(raw.badges ?? []), ...(raw.isSponsored ? (["sponsorlu"] as BadgeKey[]) : [])],
      isSponsored: raw.isSponsored ?? false,
      updatedAt: daysAgoIso(raw.updatedDaysAgo ?? hash(id) % 21),
      ratingAvg,
      ratingCount,
      ownerId: null,
    });
  }

  const lists: ListDef[] = rawLists.map((l) => ({ ...l, id: l.slug, updatedAt: daysAgoIso(hash(l.slug) % 14) }));

  return { categories, items, reviews, offers, priceHistory, lists, source: "demo" };
}
