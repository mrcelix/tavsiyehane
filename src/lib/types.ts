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
  /**
   * `hazirlaniyor`: kategori tanımlı ama içinde yayına hazır kayıt yok.
   * Kategori listelerinde "yakında" olarak görünür, gezinme hedefi olmaz.
   */
  status?: "yayinda" | "hazirlaniyor";
}

/**
 * Rozetler koşullardan otomatik hesaplanır (bkz. lib/badges.ts) — `sponsorlu` hariç,
 * o tek elle işaretlenen alandır. Elle rozet takılamaması bilinçli bir karardır.
 */
export type BadgeKey =
  | "yukselen"
  | "kategori-lideri"
  | "toplulugun-secimi"
  | "yeni-kesif"
  | "zamana-direnen"
  | "hype-tutmadi"
  | "sponsorlu";

/**
 * Kaydın nereden geldiği ve neyin doğrulandığı.
 *
 * Bu alan olmadan gerçek katalog ile demo veri arayüzde ayırt edilemez; ayırt
 * edilemediği anda site "gerçek tavsiye" iddiasını kaybeder. Bu yüzden zorunlu.
 */
export interface Provenance {
  /** `editor`: gerçek kayıt, editör doğrulaması var. `demo`: örnek veri. */
  kind: "editor" | "demo";
  /** Bilgilerin en son doğrulandığı tarih (ISO). Demo kayıtlarda yoktur. */
  verifiedAt?: string;
  /** Doğrulamanın dayandığı kaynaklar — arayüzde açıkça gösterilir. */
  sources?: SourceRef[];
}

/**
 * Kayıt görseli.
 *
 * `credit` ve `license` zorunludur — kaynağı bilinmeyen görsel siteye girmez.
 * Karşılaştırma siteleri en sık buradan dava alır: üreticinin ürün fotoğrafı
 * "internette vardı" diye kullanılmaz. Kaynağı yazamıyorsak o görseli
 * yayımlamıyoruz; üretilmiş kapak (bkz. CoverArt) bu yüzden var.
 */
export interface ItemImage {
  url: string;
  /** Ekran okuyucu için betimleme; boş bırakılamaz. */
  alt: string;
  /** Telif sahibi / kaynak adı — görselin yanında gösterilir. */
  credit: string;
  /** Kullanım hakkı: "kendi çekimimiz", "üretici basın kiti", "CC BY 4.0" gibi. */
  license: string;
  sourceUrl?: string;
}

export interface SourceRef {
  label: string;
  url?: string;
  /** Bu kaynaktan alınan bilginin tarihi (ISO) — fiyat gibi alanlar hızla eskir. */
  checkedAt?: string;
}

/**
 * Editörün doğrulanabilir kriterlere verdiği puanlar (0-100).
 * Topluluk verisi yokken puan yalnızca buradan gelir; uydurma oy üretilmez.
 */
export interface EditorialAssessment {
  /** Kriter anahtarı -> 0-100 (bkz. lib/scoring.ts EDITOR_MODELS) */
  criteria: Record<string, number>;
  /** Kriterlerin ağırlıklı ortalaması, 0-100 */
  score: number;
}

/**
 * DIŞ SİNYALLER — sitenin kendi topluluğundan değil, dışarıdan gelen ölçümler.
 *
 * Soğuk başlangıç problemi için var: ziyaretçi oyu birikene kadar hiçbir
 * kategori trend gösteremez, yani sitenin farkı olan şey tam da en çok
 * ihtiyaç duyulduğu anda görünmez.
 *
 * KRİTİK AYRIM: bunlar OY DEĞİLDİR ve hiçbir yerde oy gibi gösterilmez.
 * Arayüzde ayrı bir dayanak olarak etiketlenir ("Dış sinyal"), kaynağı ve
 * ölçüm tarihi yazılır. Bir kaydın oy sayısı hâlâ sıfırdır ve sıfır görünür.
 */
export interface ExternalSignals {
  /** Son 30 günün arama ilgi endeksi (0-100, kaynağın kendi ölçeği) */
  aramaIlgi30: number;
  /** Önceki 30 günün aynı endeksi — ivme bu ikisinin oranıdır */
  aramaIlgiOnceki30: number;
  /** Son 30 günde fiyatın yüzde değişimi; negatif = ucuzladı. Yalnızca ürün. */
  fiyatDegisim30?: number;
  /** Ölçümün nereden geldiği — kaynaksız dış sinyal kabul edilmez. */
  kaynak: SourceRef;
}

/**
 * Puanlamayı besleyen ham sinyaller. Puan bunlardan doğrudan değil,
 * her birinin kendi kategorisi içindeki yüzdelik diliminden hesaplanır.
 */
export interface ItemSignals {
  /** Son 30 günde toplanan ilgi (görüntülenme + 3×favori + 5×karşılaştırma) */
  interest30: number;
  /** Önceki 30 günün aynı ölçüsü — ivme bu ikisinin oranıdır */
  interestPrev30: number;
  /** "Denedim, tavsiye ederim" */
  votesUp: number;
  /** "Denedim, tavsiye etmem" */
  votesDown: number;
  /** "İlgimi çekti" — deneyim yok, yalnızca niyet */
  votesInterest: number;
  /** Kaç haftadır izleniyor */
  weeksTracked: number;
  /** Bu haftaların kaçında kategorisinde üst dilimdeydi */
  weeksTop: number;
  /** Editör değerlendirmesi, 0-100 */
  editor: number;
}

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
  /** Kaydın kaynağı ve doğrulama bilgisi */
  provenance: Provenance;
  /** Gerçek fotoğraf; yoksa deterministik kapak üretilir (bkz. CoverArt) */
  image?: ItemImage;
  /** Editörün doğrulanabilir kriterlere verdiği puanlar — her kayıtta bulunur */
  editorial: EditorialAssessment;
  /**
   * Ham topluluk sinyalleri. `null` ise bu kayıt için henüz topluluk verisi
   * yoktur; puan editör değerlendirmesinden gelir ve arayüz bunu belirtir.
   */
  signals: ItemSignals | null;
  /**
   * Dış ölçümler (arama ilgisi, fiyat hareketi). Topluluk verisi yokken
   * puanı besler; oy yerine geçmez, ayrı dayanak olarak etiketlenir.
   */
  external?: ExternalSignals;
  /** 0-100 tavsiye puanı */
  score: number;
  /**
   * Puanın dayanağı. Öncelik sırası: topluluk > dış sinyal > editör.
   * Hangisi kullanıldıysa kartta ve detayda yazılır — kullanıcı bir puanın
   * neye dayandığını görmeden ona güvenmek zorunda bırakılmaz.
   */
  scoreBasis: "topluluk" | "dis-sinyal" | "editor";
  /** Sinyal/kriter anahtarı -> 0-100 */
  scoreBreakdown: Record<string, number>;
  /** Kategorideki sırası (1 = lider) — rozet koşulları bunu kullanır */
  categoryRank: number;
  /** Kategorideki toplam kayıt; örneklem küçükse puan güveni düşer */
  categorySize: number;
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
