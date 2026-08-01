import { buildEditorial } from "@/lib/scoring";
import type { Item, ItemType, SourceRef } from "@/lib/types";

/**
 * GERÇEK KATALOG
 *
 * Demo veriden iki temel farkı var:
 *
 * 1. `signals` yok. Topluluk verisi ziyaretçi oylarıyla sıfırdan birikir;
 *    oy sayısı, ilgi hacmi veya "kaç haftadır izleniyor" gibi hiçbir alan
 *    üretilmez. Olmayan veri sıfır değil, yoktur.
 * 2. Yorum yok. `ratingAvg`/`ratingCount` sıfırdır ve gerçek kullanıcı yorumu
 *    gelene kadar sıfır kalır.
 *
 * Puan bu yüzden editörün doğrulanabilir kriterlerinden gelir ve arayüzde
 * "Editör değerlendirmesi" olarak etiketlenir (bkz. lib/scoring.ts).
 */
export interface CatalogItem {
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
  /**
   * Editör kriterleri (bkz. EDITOR_MODELS). Değerlendirilemeyen kriter
   * BOŞ BIRAKILIR — tahmini bir sayı yazmak, ölçülmemiş şeyi ölçülmüş
   * göstermek olur. Puan yalnızca girilen kriterlerin ağırlığına bölünür.
   */
  editorCriteria: Record<string, number>;
  whyRecommended: string;
  attrs: Record<string, string>;
  pros: string[];
  cons: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  /** Bilgilerin en son doğrulandığı tarih (ISO) */
  verifiedAt: string;
  sources: SourceRef[];
  isSponsored?: boolean;
}

export function buildCatalogItems(raw: CatalogItem[]): Item[] {
  return raw.map((r) => ({
    id: r.slug,
    slug: r.slug,
    title: r.title,
    description: r.description,
    type: r.type,
    categorySlug: r.categorySlug,
    brand: r.brand,
    city: r.city,
    district: r.district,
    price: r.price,
    priceMin: r.priceMin,
    priceMax: r.priceMax,
    priceLevel: r.priceLevel,
    provenance: { kind: "editor", verifiedAt: r.verifiedAt, sources: r.sources },
    editorial: buildEditorial(r.type, r.editorCriteria),
    signals: null,
    score: 0,
    scoreBasis: "editor",
    scoreBreakdown: {},
    categoryRank: 0,
    categorySize: 0,
    whyRecommended: r.whyRecommended,
    attrs: r.attrs,
    pros: r.pros,
    cons: r.cons,
    suitableFor: r.suitableFor,
    notSuitableFor: r.notSuitableFor,
    badges: [],
    isSponsored: r.isSponsored ?? false,
    updatedAt: r.verifiedAt,
    ratingAvg: 0,
    ratingCount: 0,
    ownerId: null,
  }));
}
