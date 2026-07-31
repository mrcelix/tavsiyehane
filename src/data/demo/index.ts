import type { Category, DataBundle } from "@/lib/types";
import { buildBundle, type TrendProfile } from "./build";
import { URUN_ITEMS } from "./urunler";
import { HIZMET_ITEMS } from "./hizmetler";
import { MEKAN_ITEMS } from "./mekanlar";

export const DEMO_CATEGORIES: Category[] = [
  { id: "telefon", slug: "telefon", name: "Telefon", type: "urun", icon: "📱", description: "Akıllı telefonlar: fiyat-performans, kamera ve dayanıklılığa göre en iyiler" },
  { id: "robot-supurge", slug: "robot-supurge", name: "Robot Süpürge", type: "urun", icon: "🤖", description: "Haritalama, emiş gücü ve istasyon özelliklerine göre en iyi robot süpürgeler" },
  { id: "kedi-urunleri", slug: "kedi-urunleri", name: "Kedi Ürünleri", type: "urun", icon: "🐱", description: "Mama, kum, su pınarı ve aksesuarlarda kediniz için en iyi seçimler" },
  { id: "kisisel-bakim", slug: "kisisel-bakim", name: "Kişisel Bakım", type: "urun", icon: "🪒", description: "Tıraş, saç ve ağız bakımı cihazlarında topluluğun en çok önerdikleri" },
  { id: "ev-temizligi", slug: "ev-temizligi", name: "Ev Temizliği", type: "hizmet", icon: "🧹", description: "Sigortalı, belgeli ve doğrulanmış yorumlu ev temizlik hizmetleri" },
  { id: "nakliye", slug: "nakliye", name: "Nakliye", type: "hizmet", icon: "🚚", description: "Evden eve nakliyat, küçük taşıma ve KOBİ kargo çözümleri" },
  { id: "teknik-servis", slug: "teknik-servis", name: "Teknik Servis", type: "hizmet", icon: "🔧", description: "Beyaz eşya, elektronik, klima ve kombi için güvenilir servisler" },
  { id: "usta-tamirat", slug: "usta-tamirat", name: "Usta & Tamirat", type: "hizmet", icon: "🛠️", description: "Boya, tesisat, elektrik ve tadilatta belgesi doğrulanmış ustalar" },
  { id: "restoran", slug: "restoran", name: "Restoran", type: "mekan", icon: "🍽️", description: "Lezzet, hizmet ve fiyat dengesine göre şehrin en iyi restoranları" },
  { id: "kafe", slug: "kafe", name: "Kafe", type: "mekan", icon: "☕", description: "Çalışmaya, sohbete ve kahvaltıya uygun en iyi kafeler" },
  { id: "otel", slug: "otel", name: "Otel", type: "mekan", icon: "🏨", description: "İş, tatil ve kaçamak için amaca göre en iyi konaklamalar" },
  { id: "spor-tesisi", slug: "spor-tesisi", name: "Spor Tesisi", type: "mekan", icon: "🏋️", description: "Salon, havuz, halı saha ve stüdyolarda amacına en uygun tesisler" },
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
  "proplan-sterilised-kedi-mamasi": "oturmus",
  "beyaz-nokta-servis-ankara": "oturmus",
  "meze-sokagi-beyoglu": "oturmus",
  "anadolu-kebap-evi-ankara": "oturmus",
  "firin-kahve-bursa": "oturmus",
  "uludag-kar-otel": "oturmus",

  // Son dönemde hızlanan
  "petkit-otomatik-mama-kabi": "yukselen",
  "dreame-d10-plus-gen2": "yukselen",
  "pratik-tasima-istanbul": "yukselen",
  "verde-vegan-mutfak": "yukselen",
  "kapadokya-tas-konak": "yukselen",
  "cip-bilgisayar-servisi": "yukselen",
  "google-pixel-9a": "yukselen",
  "dreame-l10s-ultra": "yukselen",
  "temiz-adim-abonelik": "yukselen",
  "marmara-asansorlu-nakliyat": "yukselen",
  "roast-lab-istanbul": "yukselen",
  "balkon-bistro-ankara": "yukselen",
  "zeytin-konak-ayvalik": "yukselen",

  // Yeni yayına giren
  "ege-parlak-temizlik-izmir": "yeni",
  "cikolata-atolyesi-izmir": "yeni",
  "oppo-reno13-f": "yeni",
  "yesil-temiz-ekolojik": "yeni",
  "depo360-esya-depolama": "yeni",
  "pati-kedi-kafe-ankara": "yeni",
  "sofra-bulgur-bursa": "yeni",

  // Çok konuşuluyor ama deneyenler memnun değil
  "tecno-spark-30-pro": "hype",
  "hizli-cozum-kombi-ankara": "hype",
  "honor-magic7-lite": "hype",
  "xiaomi-robot-vacuum-e10": "hype",
  "kolay-tasi-ogrenci": "hype",
  "sahil-kahve-izmir": "hype",

  // Yeni kategoriler
  "philips-oneblade-360": "oturmus",
  "braun-series-7-tras-makinesi": "oturmus",
  "revlon-one-step-sac-sekillendirici": "yukselen",
  "philips-lumea-ipl-epilator": "hype",
  "xiaomi-mi-tas-sac-kurutma": "yeni",
  "usta-boya-istanbul": "oturmus",
  "su-tesisati-724-ankara": "yukselen",
  "anahtar-teslim-tadilat-istanbul": "oturmus",
  "mobilya-montaj-ekibi-istanbul": "yeni",
  "klima-montaj-servisi-ankara": "hype",
  "formda-spor-salonu-istanbul": "oturmus",
  "dikey-tirmanis-merkezi-istanbul": "yukselen",
  "denge-pilates-studyo-ankara": "yukselen",
  "buz-pateni-arena-istanbul": "hype",
  "ring-boks-kulubu-bursa": "yeni",
};

let cached: DataBundle | null = null;

export function getDemoBundle(): DataBundle {
  if (!cached) {
    cached = buildBundle(DEMO_CATEGORIES, [...URUN_ITEMS, ...HIZMET_ITEMS, ...MEKAN_ITEMS], TREND_PROFILES);
  }
  return cached;
}
