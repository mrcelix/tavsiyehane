import type { Category, DataBundle } from "@/lib/types";
import { buildBundle, type TrendProfile } from "./build";
import { buildCatalogItems } from "@/data/catalog/build";
import { TELEFON_CATALOG } from "@/data/catalog/telefon";
import { URUN_ITEMS } from "./urunler";
import { HIZMET_ITEMS } from "./hizmetler";
import { MEKAN_ITEMS } from "./mekanlar";

export const DEMO_CATEGORIES: Category[] = [
  { id: "telefon", slug: "telefon", name: "Telefon", type: "urun", icon: "📱", description: "Akıllı telefonlar: fiyat-performans, kamera ve dayanıklılığa göre en iyiler" },
  { id: "robot-supurge", slug: "robot-supurge", name: "Robot Süpürge", type: "urun", icon: "🤖", description: "Haritalama, emiş gücü ve istasyon özelliklerine göre en iyi robot süpürgeler" },
  // Kediyi tek kategoride tutmak filtrelemeyi bozuyordu: mamanın "Protein"i ile
  // taşıma çantasının "Ölçü"sü ortak bir boyut üretmiyor. Üç ayrı kategori
  // hem karşılaştırmayı hem filtre panelini anlamlı hale getiriyor.
  { id: "kedi-mamasi", slug: "kedi-mamasi", name: "Kedi Maması", type: "urun", icon: "🐱", description: "Kuru, yaş ve veteriner diyet mamalarında kediniz için en iyi seçimler" },
  { id: "kedi-kumu", slug: "kedi-kumu", name: "Kedi Kumu", type: "urun", icon: "🪣", description: "Topaklanma, koku kontrolü ve toz oranına göre en iyi kedi kumları" },
  { id: "kedi-aksesuar", slug: "kedi-aksesuar", name: "Kedi Aksesuarları", type: "urun", icon: "🧶", description: "Tuvalet, tırmalama, taşıma, su pınarı ve yatakta topluluğun tercihleri" },
  { id: "kisisel-bakim", slug: "kisisel-bakim", name: "Kişisel Bakım", type: "urun", icon: "🪒", description: "Tıraş, saç ve ağız bakımı cihazlarında topluluğun en çok önerdikleri" },
  { id: "ev-temizligi", slug: "ev-temizligi", name: "Ev Temizliği", type: "hizmet", icon: "🧹", description: "Sigortalı, belgeli ve doğrulanmış yorumlu ev temizlik hizmetleri" },
  { id: "nakliye", slug: "nakliye", name: "Nakliye", type: "hizmet", icon: "🚚", description: "Evden eve nakliyat, küçük taşıma ve KOBİ kargo çözümleri" },
  { id: "teknik-servis", slug: "teknik-servis", name: "Teknik Servis", type: "hizmet", icon: "🔧", description: "Beyaz eşya, elektronik, klima ve kombi için güvenilir servisler" },
  { id: "usta-tamirat", slug: "usta-tamirat", name: "Usta & Tamirat", type: "hizmet", icon: "🛠️", description: "Boya, tesisat, elektrik ve tadilatta belgesi doğrulanmış ustalar" },
  { id: "restoran", slug: "restoran", name: "Restoran", type: "mekan", icon: "🍽️", description: "Lezzet, hizmet ve fiyat dengesine göre şehrin en iyi restoranları" },
  { id: "kafe", slug: "kafe", name: "Kafe", type: "mekan", icon: "☕", description: "Çalışmaya, sohbete ve kahvaltıya uygun en iyi kafeler" },
  { id: "otel", slug: "otel", name: "Otel", type: "mekan", icon: "🏨", description: "İş, tatil ve kaçamak için amaca göre en iyi konaklamalar" },
  { id: "spor-tesisi", slug: "spor-tesisi", name: "Spor Tesisi", type: "mekan", icon: "🏋️", description: "Salon, havuz, halı saha ve stüdyolarda amacına en uygun tesisler" },

  // Yol haritası: tanımlı ama içi henüz doldurulmamış kategoriler. Bunlar
  // "hazırlanıyor" olarak işaretlenir; kategori menüsünde görünür ama boş bir
  // liste sayfasına götürmez. Kayıt eklendikçe `status` kaldırılır.
  { id: "kulaklik", slug: "kulaklik", name: "Kulaklık", type: "urun", icon: "🎧", description: "Kablosuz, gürültü engelleyici ve oyuncu kulaklıklarında en iyiler", status: "hazirlaniyor" },
  { id: "televizyon", slug: "televizyon", name: "Televizyon", type: "urun", icon: "📺", description: "Panel tipi, görüntü kalitesi ve yazılım desteğine göre en iyi televizyonlar", status: "hazirlaniyor" },
  { id: "dizustu-bilgisayar", slug: "dizustu-bilgisayar", name: "Dizüstü Bilgisayar", type: "urun", icon: "💻", description: "Öğrenci, ofis ve oyun kullanımına göre en iyi dizüstü bilgisayarlar", status: "hazirlaniyor" },
  { id: "akilli-saat", slug: "akilli-saat", name: "Akıllı Saat", type: "urun", icon: "⌚", description: "Sağlık takibi, pil ömrü ve uyumluluğa göre en iyi akıllı saatler", status: "hazirlaniyor" },
  { id: "mutfak-aletleri", slug: "mutfak-aletleri", name: "Mutfak Aletleri", type: "urun", icon: "🍳", description: "Kahve makinesi, airfryer ve blenderda topluluğun tercihleri", status: "hazirlaniyor" },
  { id: "bebek-urunleri", slug: "bebek-urunleri", name: "Bebek Ürünleri", type: "urun", icon: "🍼", description: "Puset, oto koltuğu, mama sandalyesi ve bakım ürünlerinde en iyiler", status: "hazirlaniyor" },

  { id: "guzellik-bakim", slug: "guzellik-bakim", name: "Güzellik & Bakım", type: "hizmet", icon: "💇", description: "Kuaför, cilt bakımı ve estetik hizmetlerinde belgeli sağlayıcılar", status: "hazirlaniyor" },
  { id: "egitim-kurs", slug: "egitim-kurs", name: "Eğitim & Kurs", type: "hizmet", icon: "🎓", description: "Dil, meslek ve sınav kurslarında sonuçları doğrulanmış kurumlar", status: "hazirlaniyor" },
  { id: "arac-servisi", slug: "arac-servisi", name: "Araç Servisi", type: "hizmet", icon: "🚗", description: "Periyodik bakım, kaporta ve lastikte yetkili ve özel servisler", status: "hazirlaniyor" },
  { id: "saglik-klinik", slug: "saglik-klinik", name: "Sağlık & Klinik", type: "hizmet", icon: "🩺", description: "Diş, göz ve fizik tedavi kliniklerinde ruhsatı doğrulanmış merkezler", status: "hazirlaniyor" },
  { id: "organizasyon", slug: "organizasyon", name: "Düğün & Organizasyon", type: "hizmet", icon: "🎉", description: "Düğün, doğum günü ve kurumsal etkinlikte sözleşmesi net firmalar", status: "hazirlaniyor" },
  { id: "evcil-hayvan-hizmeti", slug: "evcil-hayvan-hizmeti", name: "Evcil Hayvan Hizmetleri", type: "hizmet", icon: "🐾", description: "Veteriner, pet kuaförü ve otel hizmetlerinde güvenilir adresler", status: "hazirlaniyor" },

  { id: "kahvalti", slug: "kahvalti", name: "Kahvaltı Salonu", type: "mekan", icon: "🥐", description: "Serpme, köy kahvaltısı ve brunch için en iyi adresler", status: "hazirlaniyor" },
  { id: "tatli-pastane", slug: "tatli-pastane", name: "Tatlı & Pastane", type: "mekan", icon: "🍰", description: "Baklava, pasta ve dondurmada şehrin en çok önerilenleri", status: "hazirlaniyor" },
  { id: "gezi-noktasi", slug: "gezi-noktasi", name: "Gezi Noktası", type: "mekan", icon: "🗺️", description: "Müze, tarihi yapı ve doğa rotalarında gezilecek yerler", status: "hazirlaniyor" },
  { id: "eglence", slug: "eglence", name: "Eğlence", type: "mekan", icon: "🎳", description: "Sinema, bowling, escape room ve canlı müzik mekânları", status: "hazirlaniyor" },
  { id: "cocuk-aktivite", slug: "cocuk-aktivite", name: "Çocuk Aktivite", type: "mekan", icon: "🧸", description: "Oyun alanları, atölyeler ve çocuk dostu mekânlar", status: "hazirlaniyor" },
  { id: "spa-hamam", slug: "spa-hamam", name: "Spa & Hamam", type: "mekan", icon: "🧖", description: "Hamam, sauna ve masaj merkezlerinde hijyeni doğrulanmış tesisler", status: "hazirlaniyor" },
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

  // Kedi kategorileri
  "hills-science-plan-yetiskin-kedi-mamasi": "oturmus",
  "acana-tahilsiz-kedi-mamasi": "yukselen",
  "brit-care-somonlu-kedi-mamasi": "yukselen",
  "reflex-plus-kisirlastirilmis-kedi-mamasi": "oturmus",
  "sheba-yas-mama-secmeler": "yeni",
  "felix-yas-mama-cesitli-secmeler": "hype",
  "ever-clean-extra-strong-kedi-kumu": "oturmus",
  "catsan-hygiene-plus-kedi-kumu": "oturmus",
  "tofu-yesil-cay-kedi-kumu": "yukselen",
  "golden-grey-master-kedi-kumu": "yukselen",
  "sanicat-kristal-silika-kedi-kumu": "hype",
  "mia-kokusuz-kedi-kumu": "yeni",
  "moderna-acik-kedi-tuvaleti": "yeni",
  "trixie-malaga-kumas-tasima-cantasi": "yukselen",
  "catit-oluklu-karton-tirmalama": "hype",
};

/** Gerçek katalog. Bir kategoriye gerçek kayıt girdiği anda o kategorinin demo verisi devreden çıkar. */
const CATALOG_ITEMS = buildCatalogItems([...TELEFON_CATALOG]);

/**
 * Gerçek katalog bir kategoriyi devraldığında demo kayıtları listeden düşer.
 * Demo ve gerçek kaydın aynı kohortta yan yana durması iki şeyi birden bozar:
 * puanlama (uydurma sinyal gerçek kaydın önüne geçer) ve güven (kullanıcı
 * hangisinin gerçek olduğunu ayırt edemez).
 */
const GERCEK_KATEGORILER = new Set(CATALOG_ITEMS.map((i) => i.categorySlug));

let cached: DataBundle | null = null;

export function getDemoBundle(): DataBundle {
  if (!cached) {
    const demoItems = [...URUN_ITEMS, ...HIZMET_ITEMS, ...MEKAN_ITEMS].filter(
      (i) => !GERCEK_KATEGORILER.has(i.categorySlug)
    );
    cached = buildBundle(DEMO_CATEGORIES, demoItems, TREND_PROFILES, CATALOG_ITEMS);
  }
  return cached;
}
