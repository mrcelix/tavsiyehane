import type { CatalogItem } from "./build";

/**
 * TELEFON — gerçek katalog, ilk parti.
 *
 * Her kayıttaki teknik özellikler üreticinin resmi Türkiye sayfasından,
 * fiyatlar fiyat karşılaştırma sitelerinin o tarihteki en düşük listelemesinden
 * alınmıştır. Fiyat en hızlı eskiyen alandır; bu yüzden her kaynağın kontrol
 * tarihi kayda yazılır ve arayüzde gösterilir.
 *
 * Editör kriterleri (bkz. EDITOR_MODELS.urun) yalnızca kamuya açık bilgiden
 * değerlendirilebilenlerle doldurulmuştur. Cihazı elimize alıp test etmediğimiz
 * sürece "kullanıcı memnuniyeti" gibi bir not verilmez — o topluluğun işidir.
 */

const KONTROL = "2026-07-31";

export const TELEFON_CATALOG: CatalogItem[] = [
  {
    slug: "apple-iphone-17-256gb",
    title: "Apple iPhone 17 256 GB",
    description:
      "6,3 inç 120 Hz OLED ekran ve A19 işlemciyle gelen standart iPhone modeli; uzun yazılım desteği arayanların referans noktası.",
    type: "urun",
    categorySlug: "telefon",
    brand: "Apple",
    price: 71989,
    editorCriteria: {
      ozellikSeviyesi: 92,
      fiyatKarsiligi: 58,
      garantiDestek: 95,
      erisilebilirlik: 90,
      bilgiGuvenilirligi: 90,
    },
    whyRecommended:
      "Apple'ın yazılım destek süresi kategoride en uzunudur; cihazı beş yıldan fazla kullanmayı planlayanlar için toplam maliyeti ilk fiyatın anlattığından düşük çıkarır. Buna karşılık aynı donanım seviyesini Android tarafında yarı fiyata veren modeller var.",
    attrs: {
      Ekran: '6,3" OLED, 120 Hz',
      İşlemci: "Apple A19",
      Depolama: "256 GB",
      Garanti: "2 yıl Apple Türkiye",
      "Resmi Fiyat": "77.999 TL (Apple Türkiye)",
      "Piyasa En Düşük": "71.989 TL",
    },
    pros: [
      "Kategorideki en uzun yazılım destek taahhüdü",
      "Yaygın yetkili servis ağı",
      "İkinci el değerini iyi koruyor",
    ],
    cons: [
      "Aynı performans Android tarafında belirgin biçimde daha ucuz",
      "Kutuda şarj adaptörü yok",
      "Depolama yükseltmesi pahalı",
    ],
    suitableFor: ["Uzun yıllar kullanacaklar", "Apple ekosistemindekiler", "İkinci el değerini önemseyenler"],
    notSuitableFor: ["Bütçe öncelikliler", "Donanım başına en çok özelliği isteyenler"],
    verifiedAt: KONTROL,
    sources: [
      { label: "Apple Türkiye — ürün sayfası", url: "https://www.apple.com/tr/shop/buy-iphone/iphone-17", checkedAt: KONTROL },
      { label: "Akakçe — fiyat karşılaştırma", url: "https://www.akakce.com/cep-telefonu/en-ucuz-iphone-17-fiyati,370526300.html", checkedAt: KONTROL },
    ],
  },
  {
    slug: "samsung-galaxy-s25-fe-256gb",
    title: "Samsung Galaxy S25 FE 256 GB",
    description:
      "Amiral gemisi serisinin erişilebilir üyesi; 8 GB bellek ve 256 GB depolamayla Eylül 2025'te Türkiye'de satışa sunuldu.",
    type: "urun",
    categorySlug: "telefon",
    brand: "Samsung",
    price: 36544,
    editorCriteria: {
      ozellikSeviyesi: 84,
      fiyatKarsiligi: 76,
      garantiDestek: 88,
      erisilebilirlik: 92,
      bilgiGuvenilirligi: 90,
    },
    whyRecommended:
      "Samsung'un uzun güncelleme taahhüdünü amiral gemisi fiyatını ödemeden veren model. Son üç ayda 32.306 TL'ye kadar indiği için fiyat takibi yapmaya değer: aynı cihaz için aradaki fark dört bin lirayı buluyor.",
    attrs: {
      Ekran: '6,7" Dynamic AMOLED 2X, 120 Hz',
      Depolama: "256 GB",
      RAM: "8 GB",
      Garanti: "2 yıl Samsung Türkiye",
      "Piyasa En Düşük": "36.544 TL",
      "Son 3 Ay En Düşük": "32.306 TL",
    },
    pros: [
      "Amiral gemisi ekran paneli, orta segment fiyatı",
      "Uzun güncelleme taahhüdü",
      "Yaygın yetkili servis",
      "Sık indirime giriyor",
    ],
    cons: ["Fiyatı dalgalı, zamanlama önemli", "Şarj hızı rakiplerinin gerisinde"],
    suitableFor: ["Amiral gemisi ekran isteyip bütçesini zorlamak istemeyenler", "Uzun süre kullanacaklar"],
    notSuitableFor: ["Hemen almak zorunda olanlar (indirim beklemeye değer)"],
    verifiedAt: KONTROL,
    sources: [
      { label: "Samsung Türkiye — ürün sayfası", url: "https://www.samsung.com/tr/smartphones/galaxy-s/", checkedAt: KONTROL },
      { label: "Cimri — 18 satıcı fiyat karşılaştırma", url: "https://www.cimri.com/cep-telefonlari/en-ucuz-samsung-galaxy-s25-fe-fiyatlari,a2405102761", checkedAt: "2026-07-30" },
    ],
  },
  {
    slug: "samsung-galaxy-a56-256gb",
    title: "Samsung Galaxy A56 256 GB",
    description:
      "Orta segmentin en yaygın modellerinden; 256 GB depolama ve Samsung'un uzun güncelleme politikasıyla geliyor.",
    type: "urun",
    categorySlug: "telefon",
    brand: "Samsung",
    price: 22046,
    editorCriteria: {
      ozellikSeviyesi: 70,
      fiyatKarsiligi: 84,
      garantiDestek: 88,
      erisilebilirlik: 95,
      bilgiGuvenilirligi: 88,
    },
    whyRecommended:
      "Yirmi bin lira bandında uzun güncelleme taahhüdü veren az sayıdaki cihazdan. Renk seçimi fiyatı doğrudan etkiliyor: aynı modelin yeşil versiyonu gri versiyonundan yaklaşık 2.500 TL ucuz.",
    attrs: {
      Depolama: "256 GB",
      RAM: "8 GB",
      Garanti: "2 yıl Samsung Türkiye",
      "Piyasa En Düşük": "22.046 TL (yeşil)",
      "Renk Farkı": "Gri versiyonu 24.499 TL'den başlıyor",
      "Satıcı Sayısı": "128 mağaza",
    },
    pros: ["Uzun güncelleme taahhüdü", "Çok yaygın bulunabilirlik", "Renk seçimiyle ciddi fiyat avantajı"],
    cons: ["Amiral gemisi performansı beklenmemeli", "Renkler arası fiyat farkı kafa karıştırıcı"],
    suitableFor: ["Orta bütçe", "Uzun süre kullanacaklar", "İlk kez Samsung alacaklar"],
    notSuitableFor: ["Oyun performansı arayanlar"],
    verifiedAt: KONTROL,
    sources: [
      { label: "Akakçe — 128 mağaza fiyat karşılaştırma", url: "https://www.akakce.com/cep-telefonu/en-ucuz-samsung-galaxy-a56-fiyati,786484511.html", checkedAt: KONTROL },
    ],
  },
  {
    slug: "xiaomi-redmi-note-14-pro-256gb",
    title: "Xiaomi Redmi Note 14 Pro 5G 256 GB",
    description:
      "Leica destekli kamera sistemiyle gelen 5G orta segment model; on beş bin lira altındaki en çok listelenen cihazlardan.",
    type: "urun",
    categorySlug: "telefon",
    brand: "Xiaomi",
    price: 13975,
    editorCriteria: {
      ozellikSeviyesi: 68,
      fiyatKarsiligi: 92,
      garantiDestek: 72,
      erisilebilirlik: 88,
      bilgiGuvenilirligi: 80,
    },
    whyRecommended:
      "On dört bin lira bandında 5G ve Leica işbirlikli kamera veren tek modellerden. Bu segmentte asıl ayrım donanımda değil güncelleme süresinde çıkıyor; Xiaomi'nin taahhüdü Samsung'un gerisinde.",
    attrs: {
      Depolama: "256 GB",
      RAM: "8 GB",
      Bağlantı: "5G",
      Kamera: "Leica işbirlikli sistem",
      "Piyasa En Düşük": "13.975 TL",
    },
    pros: ["Segmentinde güçlü kamera", "5G", "Çok uygun fiyat"],
    cons: ["Güncelleme taahhüdü Samsung'un gerisinde", "Arayüzde reklam yerleşimleri", "Servis ağı daha dar"],
    suitableFor: ["Bütçe öncelikliler", "Fotoğraf çeken orta segment kullanıcıları"],
    notSuitableFor: ["Cihazı beş yıl kullanmayı planlayanlar"],
    verifiedAt: KONTROL,
    sources: [
      { label: "Xiaomi Türkiye — ürün sayfası", url: "https://www.mi.com/tr/product/redmi-note-14-pro/", checkedAt: KONTROL },
      { label: "Cimri — fiyat karşılaştırma", url: "https://www.cimri.com/cep-telefonlari/en-ucuz-xiaomi-redmi-note-14-pro-fiyatlari,a2372365369", checkedAt: "2026-07-13" },
    ],
  },
  {
    slug: "red-magic-11-pro-256gb",
    title: "Red Magic 11 Pro 12/256 GB",
    description:
      "Oyun odaklı amiral gemisi; dahili soğutma fanı ve omuz tuşlarıyla Türkiye'de resmi olarak satılıyor.",
    type: "urun",
    categorySlug: "telefon",
    brand: "Red Magic",
    price: 59999,
    editorCriteria: {
      ozellikSeviyesi: 96,
      fiyatKarsiligi: 74,
      garantiDestek: 60,
      erisilebilirlik: 55,
      bilgiGuvenilirligi: 85,
    },
    whyRecommended:
      "Ham performansta Türkiye'de satılan en güçlü Android cihaz. Karşılığında servis ağı ve aksesuar bulunabilirliği ana akım markaların çok gerisinde; günlük kullanım telefonu arayan için doğru tercih değil.",
    attrs: {
      RAM: "12 GB",
      Depolama: "256 GB",
      Soğutma: "Dahili fan",
      "Oyun Kontrolü": "Omuz tuşları",
      "Resmi Fiyat": "59.999 TL (üretici sitesi)",
    },
    pros: ["Türkiye'de satılan en güçlü Android performansı", "Aktif soğutma", "Omuz tuşları"],
    cons: ["Servis ağı dar", "Aksesuar bulmak zor", "Kalın ve ağır gövde", "Kamera performansı fiyatının gerisinde"],
    suitableFor: ["Mobil oyuncular", "En yüksek performansı arayanlar"],
    notSuitableFor: ["Servis kolaylığı arayanlar", "Fotoğraf önceliği olanlar", "Kompakt cihaz isteyenler"],
    verifiedAt: KONTROL,
    sources: [
      { label: "Red Magic — resmi Türkiye satış sayfası", url: "https://www.redmagic.gg/", checkedAt: KONTROL },
      { label: "Webtekno — Temmuz 2026 en güçlü Android telefonlar", url: "https://www.webtekno.com/temmuz-2026-en-guclu-android-telefonlar-h219624.html", checkedAt: KONTROL },
    ],
  },
];
