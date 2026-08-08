import type { DataBundle, Item, ItemType } from "./types";
import { attrFacetValues } from "./attrs";
import { slugify } from "./format";

export interface ItemFilters {
  q?: string;
  type?: ItemType;
  categorySlug?: string;
  city?: string;
  district?: string;
  brand?: string;
  minScore?: number;
  maxPrice?: number;
  minPrice?: number;
  badge?: string;
  maxPriceLevel?: number;
  /**
   * Gelişmiş filtre: her boyut için seçilen değerler.
   * Aynı boyut içinde VEYA, boyutlar arasında VE mantığı uygulanır —
   * "8 GB veya 12 GB RAM" ile "ve Samsung" gibi.
   */
  facets?: Record<string, string[]>;
}

/** Kaydın bir filtre boyutundaki değerlerini döndürür. */
function facetValues(item: Item, param: string): string[] {
  if (param === "rozet") return item.badges;
  if (param === "marka") return item.brand ? [item.brand] : [];
  if (param === "sehir") return item.city ? [item.city] : [];
  if (param === "ilce") return item.district ? [item.district] : [];
  if (param === "uygun") return item.suitableFor;
  if (param.startsWith("oz.")) {
    // Panelde normalize edilmiş değerler gösterilir; eşleştirme de aynı
    // fonksiyondan geçmeli, yoksa seçilen filtre hiçbir kaydı getirmez.
    const alan = param.slice(3);
    return attrFacetValues(alan, item.attrs[alan]);
  }
  return [];
}

function matchesFacets(item: Item, facets: Record<string, string[]>): boolean {
  for (const [param, secilenler] of Object.entries(facets)) {
    if (secilenler.length === 0) continue;
    const mevcut = facetValues(item, param);
    if (!secilenler.some((s) => mevcut.includes(s))) return false;
  }
  return true;
}

export type SortKey = "puan" | "fiyat-artan" | "fiyat-azalan" | "yorum" | "yeni";

/** Bütçe karşılaştırması için tekil fiyat: ürün fiyatı ya da hizmet başlangıç fiyatı. */
export function effectivePrice(item: Item): number | undefined {
  return item.price ?? item.priceMin;
}

/** Arama sorgularında anlam taşımayan ekler/bağlaçlar. */
const STOPWORDS = new Set([
  "tl", "₺", "lira", "bin", "altı", "alti", "altında", "altinda", "üstü", "ustu", "kadar",
  "için", "icin", "ile", "ve", "veya", "en", "iyi", "iyisi", "uygun", "bir", "mi", "mı",
  "alınabilecek", "alinabilecek", "arıyorum", "ariyorum", "istiyorum", "lazım", "lazim", "olan",
]);

/** "25.000 TL altı telefon" gibi sorgulardan bütçe + anahtar kelimeleri ayıklar. */
export function parseSearchQuery(q: string): { words: string[]; maxPrice?: number } {
  let maxPrice: number | undefined;
  const cleaned = q.toLocaleLowerCase("tr").replace(/(\d[\d.,]*)\s*(bin)?/g, (_, num: string, bin?: string) => {
    const n = Number(num.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(n) && n >= (bin ? 1 : 500)) {
      maxPrice = Math.round(n * (bin ? 1000 : 1));
      return " ";
    }
    return _;
  });
  const words = cleaned.split(/[\s,]+/).filter((w) => w && !STOPWORDS.has(w));
  return { words, maxPrice };
}

/** Gövdenin anlamlı kalması için gereken en az harf sayısı. */
const MIN_GOVDE = 4;

function wordMatches(hay: string, haySlug: string, word: string): boolean {
  if (hay.includes(word) || haySlug.includes(slugify(word))) return true;

  // Kaba Türkçe ek toleransı. Tek bir kesim yetmez: "-ler", "-ları", "-ında"
  // gibi ekler iki harften uzun olduğu için sabit kesim "kediler"i "kedile"
  // yapar ve hiçbir şeyle eşleşmez. Bu yüzden gövde kısala kısala denenir;
  // MIN_GOVDE altına inilmez, yoksa "kek" ile "kediler" eşleşmeye başlar.
  const enFazlaKesim = Math.min(4, word.length - MIN_GOVDE);
  for (let kesim = 1; kesim <= enFazlaKesim; kesim++) {
    const govde = word.slice(0, word.length - kesim);
    if (hay.includes(govde) || haySlug.includes(slugify(govde))) return true;
  }
  return false;
}

function matchesQuery(item: Item, q: string, categoryName: string): boolean {
  const hay = [item.title, item.brand, item.description, item.city, item.district, categoryName, ...Object.values(item.attrs), ...item.suitableFor]
    .join(" ")
    .toLocaleLowerCase("tr");
  const haySlug = slugify(hay);
  const { words } = parseSearchQuery(q);
  if (words.length === 0) return true;
  return words.every((word) => wordMatches(hay, haySlug, word));
}

/**
 * Serbest metin araması: bütçeyi ayıklar, kalan kelimeleri alan ağırlığıyla eşleştirir.
 * Başlık/kategori eşleşmesi açıklama veya özellik alanı eşleşmesinden üstte sıralanır.
 */
export function searchItems(bundle: DataBundle, q: string): Item[] {
  const { words, maxPrice } = parseSearchQuery(q);
  const catName = new Map(bundle.categories.map((c) => [c.slug, c.name]));

  const scored: { item: Item; relevance: number }[] = [];
  for (const item of bundle.items) {
    const price = effectivePrice(item);
    if (maxPrice && price !== undefined && price > maxPrice) continue;

    if (words.length === 0) {
      scored.push({ item, relevance: 1 });
      continue;
    }

    const tiers = [
      { text: [item.title, item.brand, catName.get(item.categorySlug) ?? ""].join(" ").toLocaleLowerCase("tr"), weight: 3 },
      { text: [item.description, item.city, item.district, ...item.suitableFor].join(" ").toLocaleLowerCase("tr"), weight: 2 },
      { text: Object.values(item.attrs).join(" ").toLocaleLowerCase("tr"), weight: 1 },
    ].map((t) => ({ ...t, slug: slugify(t.text) }));

    let relevance = 0;
    let allMatched = true;
    for (const word of words) {
      const tier = tiers.find((t) => wordMatches(t.text, t.slug, word));
      if (!tier) {
        allMatched = false;
        break;
      }
      relevance += tier.weight;
    }
    if (allMatched) scored.push({ item, relevance });
  }

  return scored
    .sort((a, b) => b.relevance - a.relevance || b.item.score - a.item.score)
    .map((s) => s.item);
}

export function filterItems(bundle: DataBundle, f: ItemFilters): Item[] {
  const catName = new Map(bundle.categories.map((c) => [c.slug, c.name]));
  return bundle.items.filter((it) => {
    if (f.type && it.type !== f.type) return false;
    if (f.categorySlug && it.categorySlug !== f.categorySlug) return false;
    if (f.city && slugify(it.city ?? "") !== slugify(f.city)) return false;
    if (f.district && slugify(it.district ?? "") !== slugify(f.district)) return false;
    if (f.brand && it.brand !== f.brand) return false;
    if (f.minScore && it.score < f.minScore) return false;
    if (f.badge && !it.badges.includes(f.badge as Item["badges"][number])) return false;
    if (f.maxPriceLevel && (it.priceLevel ?? 0) > f.maxPriceLevel) return false;
    const price = effectivePrice(it);
    if (f.maxPrice && price !== undefined && price > f.maxPrice) return false;
    if (f.minPrice && price !== undefined && price < f.minPrice) return false;
    if (f.facets && !matchesFacets(it, f.facets)) return false;
    if (f.q && !matchesQuery(it, f.q, catName.get(it.categorySlug) ?? "")) return false;
    return true;
  });
}

export function sortItems(items: Item[], sort: SortKey = "puan"): Item[] {
  const arr = [...items];
  switch (sort) {
    case "fiyat-artan":
      arr.sort((a, b) => (effectivePrice(a) ?? a.priceLevel ?? 0) - (effectivePrice(b) ?? b.priceLevel ?? 0));
      break;
    case "fiyat-azalan":
      arr.sort((a, b) => (effectivePrice(b) ?? b.priceLevel ?? 0) - (effectivePrice(a) ?? a.priceLevel ?? 0));
      break;
    case "yorum":
      arr.sort((a, b) => b.ratingCount - a.ratingCount || b.score - a.score);
      break;
    case "yeni":
      arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    default:
      arr.sort((a, b) => b.score - a.score);
  }
  return arr;
}

/** Aynı kategorideki en yüksek puanlı alternatifler. */
export function alternativesFor(bundle: DataBundle, item: Item, limit = 4): Item[] {
  return sortItems(
    bundle.items.filter((i) => i.categorySlug === item.categorySlug && i.id !== item.id),
    "puan"
  ).slice(0, limit);
}

/*
 * Sihirbazın cevap/filtre mantığı buradan `lib/wizard.ts`e taşındı: cevaplar
 * artık URL'de tutuluyor ve adım seçenekleri de aynı yerde üretiliyor. İkisini
 * ayrı dosyalarda tutmak, filtre ile adım sayımlarının farklı kurallara
 * kaymasına açık kapı bırakıyordu.
 */

export function uniqueCities(bundle: DataBundle, type?: ItemType): string[] {
  const set = new Set<string>();
  for (const it of bundle.items) {
    if (type && it.type !== type) continue;
    if (it.city) set.add(it.city);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}

export function uniqueBrands(items: Item[]): string[] {
  return [...new Set(items.map((i) => i.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
}
