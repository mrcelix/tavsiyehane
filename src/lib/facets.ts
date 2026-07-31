import { BADGES } from "./badges";
import type { BadgeKey, Item } from "./types";

/**
 * Filtre boyutları veriden çıkarılır — kategoriye özel alanlar elle tanımlanmaz.
 * Telefonda "RAM" çıkar, otelde "Konsept"; çünkü ikisi de o kategorinin
 * kayıtlarında gerçekten bulunan alanlardır.
 */
export interface FacetValue {
  value: string;
  count: number;
}

export interface Facet {
  /** URL'de kullanılan anahtar: rozet, marka, sehir, ilce, uygun, oz.<Alan> */
  param: string;
  label: string;
  values: FacetValue[];
}

/** Bir alanın filtre olarak anlamlı olması için gereken en az farklı değer sayısı. */
const MIN_DISTINCT = 2;
/** Çok fazla farklı değeri olan alanlar (serbest metin) filtreye uygun değildir. */
const MAX_DISTINCT = 12;

function say(values: (string | undefined)[]): FacetValue[] {
  const m = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "tr"));
}

/**
 * Kategorideki kayıtlardan filtre boyutlarını üretir.
 * `items` filtrelenmemiş kohort olmalı — sayılar hep tam kümeyi gösterir.
 */
export function buildFacets(items: Item[]): Facet[] {
  if (items.length === 0) return [];
  const out: Facet[] = [];

  // Rozetler
  const rozetSay = new Map<BadgeKey, number>();
  for (const it of items) for (const b of it.badges) rozetSay.set(b, (rozetSay.get(b) ?? 0) + 1);
  if (rozetSay.size >= MIN_DISTINCT) {
    out.push({
      param: "rozet",
      label: "Rozetler",
      values: [...rozetSay.entries()]
        .map(([k, count]) => ({ value: k, count }))
        .sort((a, b) => b.count - a.count),
    });
  }

  // Marka / işletme
  const marka = say(items.map((i) => i.brand));
  if (marka.length >= MIN_DISTINCT) {
    out.push({ param: "marka", label: items[0].type === "urun" ? "Marka" : "İşletme", values: marka });
  }

  // Konum
  const sehir = say(items.map((i) => i.city));
  if (sehir.length >= MIN_DISTINCT) out.push({ param: "sehir", label: "Şehir", values: sehir });
  const ilce = say(items.map((i) => i.district));
  if (ilce.length >= MIN_DISTINCT) out.push({ param: "ilce", label: "İlçe", values: ilce });

  // Kimler için uygun — negatif filtre değil, pozitif eşleşme
  const uygun = say(items.flatMap((i) => i.suitableFor));
  if (uygun.length >= MIN_DISTINCT) {
    out.push({ param: "uygun", label: "Kimler için uygun", values: uygun.slice(0, 14) });
  }

  // Kategoriye özel alanlar: kayıtların çoğunda bulunan ve makul sayıda değeri olanlar
  const alanlar = new Map<string, (string | undefined)[]>();
  for (const it of items) {
    for (const [k, v] of Object.entries(it.attrs)) {
      const dizi = alanlar.get(k) ?? [];
      dizi.push(v);
      alanlar.set(k, dizi);
    }
  }
  for (const [alan, degerler] of alanlar) {
    // Alan kayıtların en az yarısında bulunmalı
    if (degerler.length < items.length / 2) continue;
    const v = say(degerler);
    if (v.length < MIN_DISTINCT || v.length > MAX_DISTINCT) continue;
    // Kayıtları gerçekten gruplamayan alan filtre değildir, listedir (ör. "Adres").
    // Ölçüt: kayıtların en az yarısı, birden çok kaydın paylaştığı bir değerde olmalı.
    // "Adres"te iki kayıt tesadüfen aynı semtte olsa bile kalan altısı tekil kalır
    // ve alan elenir; "Garanti"de kayıtların çoğu birkaç değerde toplandığı için kalır.
    const gruplanan = v.reduce((t, x) => (x.count > 1 ? t + x.count : t), 0);
    if (gruplanan < items.length / 2) continue;
    out.push({ param: `oz.${alan}`, label: alan, values: v });
  }

  return out;
}

/** Rozet anahtarını okunur etikete çevirir; diğer değerler olduğu gibi gösterilir. */
export function facetValueLabel(param: string, value: string): string {
  if (param === "rozet") return BADGES[value as BadgeKey]?.label ?? value;
  return value;
}
