// Temel veri modelleri — hem demo veri katmanı hem Supabase satırları bu tiplere map edilir.

export type ItemType = "urun" | "hizmet" | "mekan";

export const ITEM_TYPES: ItemType[] = ["urun", "hizmet", "mekan"];

export const TYPE_LABELS: Record<ItemType, { singular: string; plural: string; hub: string }> = {
  urun: { singular: "Ürün", plural: "Ürünler", hub: "/urunler" },
  hizmet: { singular: "Hizmet", plural: "Hizmetler", hub: "/hizmetler" },
  mekan: { singular: "Mekân", plural: "Mekânlar", hub: "/mekanlar" },
};

export interface Category {
  id: string;
  slug: string;
  name: string;
  type: ItemType;
  icon: string; // emoji
  description: string;
}

export type BadgeKey =
  | "editor-secimi"
  | "kullanici-tercihi"
  | "fiyat-performans"
  | "premium"
  | "en-ekonomik"
  | "en-cok-tercih"
  | "yeni-yukselen"
  | "dogrulanmis"
  | "en-iyi-alternatif"
  | "sponsorlu";

export interface Offer {
  id: string;
  itemId: string;
  sellerName: string;
  sellerRating: number; // 0-10
  price: number;
  inStock: boolean;
  url: string;
}

export interface PricePoint {
  date: string; // ISO
  price: number;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  itemId: string;
  userName: string;
  rating: number; // 1-5
  criteria: Record<string, number>; // kriter anahtarı -> 1-5
  comment: string;
  isVerified: boolean;
  status: ReviewStatus;
  createdAt: string; // ISO
}

export interface Item {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ItemType;
  categorySlug: string;
  brand: string; // marka veya işletme adı
  city?: string;
  district?: string;
  price?: number; // ürün: güncel fiyat
  priceMin?: number; // hizmet: başlangıç fiyatı aralığı
  priceMax?: number;
  priceLevel?: 1 | 2 | 3 | 4; // mekân: ₺–₺₺₺₺
  score: number; // 0-100 tavsiye puanı
  scoreBreakdown: Record<string, number>; // bileşen anahtarı -> 0-100
  whyRecommended: string; // "Neden tavsiye ediyoruz?" açıklaması
  attrs: Record<string, string>; // tipe özel alanlar (görüntüleme için anahtar-değer)
  pros: string[];
  cons: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  badges: BadgeKey[];
  isSponsored: boolean;
  updatedAt: string; // ISO — "son güncelleme" olarak gösterilir
  ratingAvg: number; // onaylı yorum ortalaması (önbellek)
  ratingCount: number;
  ownerId?: string | null;
}

export interface ListDef {
  id: string;
  slug: string;
  title: string;
  description: string;
  itemSlugs: string[];
  updatedAt: string;
}

/** Tüm okuma katmanının döndürdüğü paket — Supabase'den veya demo veriden gelir. */
export interface DataBundle {
  categories: Category[];
  items: Item[];
  reviews: Review[];
  offers: Offer[];
  priceHistory: Record<string, PricePoint[]>; // itemId -> geçmiş
  lists: ListDef[];
  source: "supabase" | "demo";
}
