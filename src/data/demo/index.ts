import type { Category, DataBundle } from "@/lib/types";
import { buildBundle } from "./build";
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

const DEMO_LISTS = [
  {
    slug: "en-iyi-robot-supurgeler-2026",
    title: "2026'nın En İyi Robot Süpürgeleri",
    description: "İstasyonlu modellerden bütçe dostlarına: bu yıl parasının karşılığını en çok veren robot süpürgeler.",
    itemSlugs: ["roborock-q8-max-plus", "dreame-d10-plus-gen2", "xiaomi-robot-vacuum-x20-plus", "roborock-s8-maxv-ultra", "eufy-robovac-g35"],
  },
  {
    slug: "25000-tl-alti-en-iyi-telefonlar",
    title: "25.000 TL Altında Alınabilecek En İyi Telefonlar",
    description: "Bütçenizi aşmadan uzun ömür, iyi kamera ve akıcı ekran sunan telefonlar.",
    itemSlugs: ["samsung-galaxy-a56", "redmi-note-14-pro", "tecno-spark-30-pro"],
  },
  {
    slug: "iphone-yerine-alinabilecek-telefonlar",
    title: "iPhone Yerine Alınabilecek Telefonlar",
    description: "iOS'a geçmeden amiral gemisi deneyimi arayanlar için en güçlü Android alternatifleri.",
    itemSlugs: ["samsung-galaxy-s24-fe", "samsung-galaxy-a56", "redmi-note-14-pro"],
  },
  {
    slug: "istanbulda-guvenilir-ev-temizligi",
    title: "İstanbul'da Güvenilir Ev Temizliği Firmaları",
    description: "Sigortalı personel, net fiyat ve doğrulanmış yorum: İstanbul'da gönül rahatlığıyla kapınızı açabileceğiniz firmalar.",
    itemSlugs: ["piril-temizlik-istanbul", "beyaz-eldiven-temizlik"],
  },
  {
    slug: "istanbulda-guvenilir-nakliye-firmalari",
    title: "İstanbul'daki Güvenilir Nakliye Firmaları",
    description: "K1 belgeli, sigortalı ve sözleşmeli çalışan nakliyeciler — kapıda fiyat sürprizi yaşamayın.",
    itemSlugs: ["lodos-nakliyat", "pratik-tasima-istanbul"],
  },
  {
    slug: "kadikoyde-uzaktan-calismaya-uygun-kafeler",
    title: "Kadıköy'de Uzaktan Çalışmaya Uygun Kafeler",
    description: "Priz, hızlı internet ve sessizlik: Kadıköy'de 'bugün ofisim burası' diyebileceğiniz kafeler.",
    itemSlugs: ["bulut-kahve-kadikoy"],
  },
  {
    slug: "cocuklu-ailelere-uygun-oteller",
    title: "Çocuklu Ailelere Uygun Oteller",
    description: "Mini club, bebek altyapısı ve sığ plaj: çocuklar eğlenirken sizin de dinlenebileceğiniz oteller.",
    itemSlugs: ["pamucak-aile-resort", "vista-park-otel-istanbul"],
  },
  {
    slug: "alerjik-kediler-icin-en-iyi-urunler",
    title: "Alerjik Kediler İçin En İyi Ürünler",
    description: "Gıda alerjisi ve hassasiyeti olan kediler için veteriner onaylı mama ve parfümsüz ürünler.",
    itemSlugs: ["royal-canin-hypoallergenic-kedi-mamasi", "bentopet-topaklanan-dogal-kedi-kumu", "catit-pixi-akilli-su-pinari"],
  },
];

let cached: DataBundle | null = null;

export function getDemoBundle(): DataBundle {
  if (!cached) {
    cached = buildBundle(DEMO_CATEGORIES, [...URUN_ITEMS, ...HIZMET_ITEMS, ...MEKAN_ITEMS], DEMO_LISTS);
  }
  return cached;
}
