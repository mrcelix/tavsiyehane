/**
 * Öznitelik normalizasyonu.
 *
 * Editörler öznitelikleri serbest metin yazar: "Var (basit ped)", "2 yıl resmi
 * distribütör", "5500 Pa", "Bilgisayar, ağ kurulumu, yedekleme". Detay sayfasında
 * bu metinler olduğu gibi gösterilir — bilgi orada değerlidir. Ama filtre olarak
 * işe yaramazlar: her kayıt kendi cümlesini yazdığı için hiçbir değer iki kaydı
 * birden gruplamaz ve filtre paneli boş kalır.
 *
 * Burası aynı şeyi söyleyen metinleri tek bir filtre değerine indirger. Ham metin
 * hiç değiştirilmez; normalizasyon yalnızca filtreleme için yapılır.
 *
 * ÖNEMLİ: Filtre panelini üreten lib/facets.ts ile filtreyi uygulayan lib/query.ts
 * aynı fonksiyonu çağırmak zorundadır. Biri normalize edip diğeri etmezse panelde
 * görünen seçenek hiçbir kaydı getirmez.
 */

/** Kimlik bilgisi taşıyan, filtre olarak anlamsız alanlar (şehir/ilçe zaten ayrı boyut). */
const FILTRE_DISI = new Set(["Adres"]);

export function isFilterableAttr(alan: string): boolean {
  return !FILTRE_DISI.has(alan);
}

/**
 * Değerin içinde geçtiğinde filtre etiketine dönüşen ortak ifadeler.
 * Alan adından bağımsızdır: "Otopark: Var, ücretsiz" ile "Keşif: Ücretsiz yerinde
 * keşif" aynı "Ücretsiz" etiketini üretir. Bir değer birden çok etiket üretebilir.
 */
const SOZLUK: [RegExp, string][] = [
  [/(^|\s)yok(\s|$)/i, "Yok"],
  [/ücretsiz/i, "Ücretsiz"],
  [/ücretli|ek ücret|ayrı ücret/i, "Ücretli"],
  [/dahil/i, "Fiyata dahil"],
  [/(^|\s)var(\s|$)|mevcut/i, "Var"],
  [/zorunlu|şart(\s|$)/i, "Zorunlu"],
  [/gerekmiyor|gerekmez/i, "Gerekmiyor"],
  [/online|uygulamadan|uygulama ile/i, "Online"],
];

/** Sayıdan sonra gelebilecek birimler; bunlar dışındaki sözcük birim sayılmaz. */
const BIRIMLER = new Map<string, string>(
  [
    ["yıl", "yıl"], ["ay", "ay"], ["gün", "gün"], ["hafta", "hafta"],
    ["saat", "saat"], ["dk", "dk"], ["dakika", "dk"], ["sn", "sn"],
    ["pa", "Pa"], ["w", "W"], ["mah", "mAh"], ["mbps", "Mbps"],
    ["gb", "GB"], ["tb", "TB"], ["mp", "MP"], ["kg", "kg"], ["g", "g"],
    ["l", "L"], ["ml", "ml"], ["cm", "cm"], ["mm", "mm"],
    ["kişi", "kişi"], ["oda", "oda"], ["kademe", "kademe"], ["kat", "kat"],
    ["atış", "atış"], ["seans", "seans"],
  ],
);

interface AralikKurali {
  /** Yalnızca bu birimdeki değerler aralığa oturtulur; farklı birim olduğu gibi kalır. */
  birim: string;
  /** Sırayla denenir; `ustSinir` yoksa son kova demektir. */
  kovalar: { ustSinir?: number; etiket: string }[];
}

/**
 * Tek tek sayıların filtre olarak işe yaramadığı alanlar. "12 yıl deneyim" ile
 * "13 yıl deneyim" arasında kullanıcı için fark yoktur; "10-14 yıl" vardır.
 */
const ARALIKLAR: Record<string, AralikKurali> = {
  Deneyim: {
    birim: "yıl",
    kovalar: [
      { ustSinir: 5, etiket: "5 yıldan az" },
      { ustSinir: 10, etiket: "5-9 yıl" },
      { ustSinir: 15, etiket: "10-14 yıl" },
      { etiket: "15 yıl ve üzeri" },
    ],
  },
  "Emiş Gücü": {
    birim: "Pa",
    kovalar: [
      { ustSinir: 5000, etiket: "5.000 Pa altı" },
      { ustSinir: 8000, etiket: "5.000-7.999 Pa" },
      { etiket: "8.000 Pa ve üzeri" },
    ],
  },
  "Çalışma Süresi": {
    birim: "dk",
    kovalar: [
      { ustSinir: 120, etiket: "120 dk'dan az" },
      { ustSinir: 180, etiket: "120-179 dk" },
      { etiket: "180 dk ve üzeri" },
    ],
  },
  "Şarj Süresi": {
    birim: "saat",
    kovalar: [{ ustSinir: 2, etiket: "2 saatten az" }, { etiket: "2 saat ve üzeri" }],
  },
  "Oda Sayısı": {
    birim: "",
    kovalar: [
      { ustSinir: 20, etiket: "20 odadan az (butik)" },
      { ustSinir: 100, etiket: "20-99 oda" },
      { etiket: "100 oda ve üzeri" },
    ],
  },
};

const SAYI_DESENI = /^(\d[\d.,]*)\s*([^\s,+/]*)/;

/** "10.000" -> 10000, "1,5" -> 1.5, "6,67" -> 6.67 */
function sayiyaCevir(ham: string): number {
  return Number(ham.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
}

function ilkHarfBuyuk(s: string): string {
  return s ? s[0].toLocaleUpperCase("tr") + s.slice(1) : s;
}

function kovala(alan: string, sayi: number, birim: string): string | null {
  const kural = ARALIKLAR[alan];
  if (!kural || kural.birim !== birim) return null;
  for (const k of kural.kovalar) if (k.ustSinir === undefined || sayi < k.ustSinir) return k.etiket;
  return null;
}

/** Tek bir parçayı (virgülle ayrılmış değerin bir öğesini) filtre etiketlerine çevirir. */
function parcayiCevir(alan: string, parca: string): string[] {
  // Parantez içi açıklamayı at: "Var (basit ped)" -> "Var", "12 (butik)" -> "12"
  const sade = parca.replace(/\s*\([^)]*\)/g, "").trim();
  if (!sade) return [];

  const sozlukEslesme = SOZLUK.filter(([re]) => re.test(sade)).map(([, etiket]) => etiket);
  if (sozlukEslesme.length > 0) return sozlukEslesme;

  const sayiEslesme = SAYI_DESENI.exec(sade);
  if (sayiEslesme) {
    const sayi = sayiyaCevir(sayiEslesme[1]);
    const birim = BIRIMLER.get(sayiEslesme[2].toLocaleLowerCase("tr")) ?? "";
    if (Number.isFinite(sayi) && (birim || ARALIKLAR[alan]?.birim === "")) {
      return [kovala(alan, sayi, birim) ?? `${sayiEslesme[1]}${birim ? ` ${birim}` : ""}`];
    }
  }

  return [ilkHarfBuyuk(sade)];
}

/**
 * Bir özniteliğin filtre değerlerini üretir. Bir değer birden çok etiket
 * döndürebilir: "Bilgisayar, ağ kurulumu, yedekleme" üç ayrı filtre değeridir.
 */
export function attrFacetValues(alan: string, deger: string | undefined): string[] {
  if (!deger || !isFilterableAttr(alan)) return [];
  const parcalar = deger.split(/,\s+/);
  return [...new Set(parcalar.flatMap((p) => parcayiCevir(alan, p)))];
}
