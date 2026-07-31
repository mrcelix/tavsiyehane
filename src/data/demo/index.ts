import type { Category, DataBundle } from "@/lib/types";
import { buildBundle, type TrendProfile } from "./build";
import { URUN_ITEMS } from "./urunler";
import { HIZMET_ITEMS } from "./hizmetler";
import { MEKAN_ITEMS } from "./mekanlar";

export const DEMO_CATEGORIES: Category[] = [
  { id: "telefon", slug: "telefon", name: "Telefon", type: "urun", icon: "📱", description: "Akıllı telefonlar: fiyat-performans, kamera ve dayanıklılığa göre en iyiler" },
  { id: "robot-supurge", slug: "robot-supurge", name: "Robot Süpürge", type: "urun", icon: "🤖", description: "Haritalama, emiş gücü ve istasyon özelliklerine göre en iyi robot süpürgeler" },
  { id: "kedi-urunleri", slug: "kedi-urunleri", name: "Kedi Ürünleri", type: "urun", icon: "🐱", description: "Mama, kum, su pınarı ve aksesuarlarda kediniz için en iyi seçimler" },
  { id: "ev-temizligi", slug: "ev-temizligi", name: "Ev Temizliği", type: "hizmet", icon: "🧹", description: "Sigortalı, belgeli ve doğrulanmış yorumlu ev temizlik hizmetleri" },
  { id: "nakliye", slug: "nakliye", name: "Nakliye", type: "hizmet", icon: "🚚", description: "Evden eve nakliyat, küçük taşıma ve KOBİ kargo çözümleri" },
  { id: "teknik-servis", slug: "teknik-servis", name: "Teknik Servis", type: "hizmet", icon: "🔧", description: "Beyaz eşya, elektronik, klima ve kombi için güvenilir servisler" },
  { id: "restoran", slug: "restoran", name: "Restoran", type: "mekan", icon: "🍽️", description: "Lezzet, hizmet ve fiyat dengesine göre şehrin en iyi restoranları" },
  { id: "kafe", slug: "kafe", name: "Kafe", type: "mekan", icon: "☕", description: "Çalışmaya, sohbete ve kahvaltıya uygun en iyi kafeler" },
  { id: "otel", slug: "otel", name: "Otel", type: "mekan", icon: "🏨", description: "İş, tatil ve kaçamak için amaca göre en iyi konaklamalar" },
];

/**
 * Trend karakterleri. Sinyaller bunlara göre üretilir; amaç modelin üç farklı
 * davranışını (yükselen, oturmuş, hype'ı tutmayan) arayüzde gerçekten görebilmek.
 */
const TREND_PROFILES: Record<string, TrendProfile> = {
  // Uzun süredir üstte, istikrarlı
  "samsung-galaxy-a56": "oturmus",
  "roborock-q8-max-plus": "oturmus",
  "bentopet-topaklanan-dogal-kedi-kumu": "oturmus",
  "piril-temizlik-istanbul": "oturmus",
  "lodos-nakliyat": "oturmus",
  "ustam-teknik-servis": "oturmus",
  "eski-firin-kafe": "oturmus",
  "nar-anadolu-mutfagi": "oturmus",
  "vista-park-otel-istanbul": "oturmus",

  // Son dönemde hızlanan
  "petkit-otomatik-mama-kabi": "yukselen",
  "dreame-d10-plus-gen2": "yukselen",
  "pratik-tasima-istanbul": "yukselen",
  "verde-vegan-mutfak": "yukselen",
  "kapadokya-tas-konak": "yukselen",
  "cip-bilgisayar-servisi": "yukselen",

  // Yeni yayına giren
  "ege-parlak-temizlik-izmir": "yeni",
  "cikolata-atolyesi-izmir": "yeni",

  // Çok konuşuluyor ama deneyenler memnun değil
  "tecno-spark-30-pro": "hype",
  "hizli-cozum-kombi-ankara": "hype",
};

let cached: DataBundle | null = null;

export function getDemoBundle(): DataBundle {
  if (!cached) {
    cached = buildBundle(DEMO_CATEGORIES, [...URUN_ITEMS, ...HIZMET_ITEMS, ...MEKAN_ITEMS], TREND_PROFILES);
  }
  return cached;
}
