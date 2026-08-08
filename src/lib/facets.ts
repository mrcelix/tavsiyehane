import { attrFacetValues } from "./attrs";
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
/** Panelde bir boyut altında gösterilecek en fazla değer; kalanı kuyrukta kalır. */
const MAX_GOSTERILEN = 16;

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

  // Rozetler.
  // İki farkı var: (1) tek değer bile anlamlı, çünkü kendi kutusuyla gösteriliyor
  // ve "kategoride yalnızca bu rozet var" bilgisi de bir sonuçtur — bu yüzden
  // MIN_DISTINCT eşiğine tabi değil. (2) Sıra sayıya göre değil, BADGES'teki
  // tanım sırasına göre: kutu kategoriden kategoriye yeniden dizilirse kullanıcı
  // aradığı rozeti her seferinde baştan arar.
  const rozetSay = new Map<BadgeKey, number>();
  for (const it of items) for (const b of it.badges) rozetSay.set(b, (rozetSay.get(b) ?? 0) + 1);
  if (rozetSay.size > 0) {
    const sira = Object.keys(BADGES) as BadgeKey[];
    out.push({
      param: "rozet",
      label: "Rozetler",
      values: [...rozetSay.entries()]
        .map(([k, count]) => ({ value: k, count }))
        .sort((a, b) => sira.indexOf(a.value as BadgeKey) - sira.indexOf(b.value as BadgeKey)),
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

  // Kategoriye özel alanlar. Ham metin filtreye uygun olmadığı için değerler önce
  // normalize edilir (bkz. lib/attrs.ts): "Var (basit ped)" -> Var,
  // "2 yıl resmi distribütör" -> 2 yıl, "12 yıl" -> 10-14 yıl.
  const alanlar = new Map<string, string[][]>();
  for (const it of items) {
    for (const alan of Object.keys(it.attrs)) {
      const degerler = attrFacetValues(alan, it.attrs[alan]);
      if (degerler.length === 0) continue;
      alanlar.set(alan, [...(alanlar.get(alan) ?? []), degerler]);
    }
  }

  for (const [alan, kayitDegerleri] of alanlar) {
    // Alan kayıtların en az yarısında bulunmalı
    if (kayitDegerleri.length < items.length / 2) continue;
    const v = say(kayitDegerleri.flat());
    if (v.length < MIN_DISTINCT) continue;

    // Kayıtları gerçekten gruplamayan alan filtre değildir, listedir (ör. "İşlemci":
    // her telefonda başka bir yonga). Ölçüt: kayıtların en az yarısı, en az bir
    // değerini başka bir kayıtla paylaşmalı.
    const gruplayan = new Set(v.filter((x) => x.count > 1).map((x) => x.value));
    const kapsanan = kayitDegerleri.filter((d) => d.some((x) => gruplayan.has(x))).length;
    if (kapsanan < items.length / 2) continue;

    out.push({ param: `oz.${alan}`, label: alan, values: v.slice(0, MAX_GOSTERILEN) });
  }

  return out;
}

/** Rozet anahtarını okunur etikete çevirir; diğer değerler olduğu gibi gösterilir. */
export function facetValueLabel(param: string, value: string): string {
  if (param === "rozet") return BADGES[value as BadgeKey]?.label ?? value;
  return value;
}
