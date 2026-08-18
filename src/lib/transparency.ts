import { freshnessOf } from "./freshness";
import { isCategoryLive } from "./categories";
import type { DataBundle, Item, ItemType } from "./types";

/**
 * ŞEFFAFLIK KARNESİ
 *
 * Sitenin kendi zayıf noktalarını sayıyla yayımladığı yer.
 *
 * Neden var: site "şeffaf puanlama, kaynağı belli kayıtlar, tazelik takibi"
 * iddiasında. Bu iddiaların her biri ölçülebilir ve ölçülebilen bir iddia
 * ölçülüp yayımlanmazsa slogandan ibarettir. Karne, kullanıcının bize
 * güvenip güvenmeyeceğine kendi verimizle karar vermesini sağlıyor.
 *
 * Hiçbir sayı yuvarlanıp güzelleştirilmiyor: örnek veri oranı da, kaynaksız
 * kayıt sayısı da olduğu gibi yazılıyor.
 */

export interface KategoriKarne {
  slug: string;
  ad: string;
  type: ItemType;
  toplam: number;
  gercek: number;
  ornek: number;
  kaynakli: number;
  gorselli: number;
  taze: number;
  eskiyor: number;
  bayat: number;
  yorumlu: number;
}

export interface Karne {
  toplam: number;
  gercek: number;
  ornek: number;
  kaynakli: number;
  gorselli: number;
  bayat: number;
  eskiyor: number;
  dayanak: { topluluk: number; disSinyal: number; editor: number };
  yorum: number;
  oy: number;
  yayindakiKategori: number;
  hazirlanan: number;
  kategoriler: KategoriKarne[];
}

const kaynakVar = (i: Item) => (i.provenance.sources?.length ?? 0) > 0;
const gercekMi = (i: Item) => i.provenance.kind !== "demo";

export function karneUret(bundle: DataBundle): Karne {
  const items = bundle.items;
  const say = (f: (i: Item) => boolean) => items.filter(f).length;

  const kategoriler: KategoriKarne[] = bundle.categories
    .filter(isCategoryLive)
    .map((c) => {
      const kayitlar = items.filter((i) => i.categorySlug === c.slug);
      // Tazelik yalnızca gerçek kayıtlarda anlamlı: örnek veride doğrulama
      // kavramı yok, onları "bayat" saymak sayıyı şişirip yanlış alarm üretir.
      const gercekler = kayitlar.filter(gercekMi);
      return {
        slug: c.slug,
        ad: c.name,
        type: c.type,
        toplam: kayitlar.length,
        gercek: gercekler.length,
        ornek: kayitlar.length - gercekler.length,
        kaynakli: kayitlar.filter(kaynakVar).length,
        gorselli: kayitlar.filter((i) => Boolean(i.image)).length,
        taze: gercekler.filter((i) => freshnessOf(i) === "taze").length,
        eskiyor: gercekler.filter((i) => freshnessOf(i) === "eskiyor").length,
        bayat: gercekler.filter((i) => freshnessOf(i) === "bayat").length,
        yorumlu: kayitlar.filter((i) => i.ratingCount > 0).length,
      };
    })
    .sort((a, b) => b.toplam - a.toplam);

  const gercekler = items.filter(gercekMi);

  return {
    toplam: items.length,
    gercek: gercekler.length,
    ornek: items.length - gercekler.length,
    kaynakli: say(kaynakVar),
    gorselli: say((i) => Boolean(i.image)),
    bayat: gercekler.filter((i) => freshnessOf(i) === "bayat").length,
    eskiyor: gercekler.filter((i) => freshnessOf(i) === "eskiyor").length,
    dayanak: {
      topluluk: say((i) => i.scoreBasis === "topluluk"),
      disSinyal: say((i) => i.scoreBasis === "dis-sinyal"),
      editor: say((i) => i.scoreBasis === "editor"),
    },
    yorum: bundle.reviews.length,
    oy: items.reduce((n, i) => n + (i.signals ? i.signals.votesUp + i.signals.votesDown + i.signals.votesInterest : 0), 0),
    yayindakiKategori: bundle.categories.filter(isCategoryLive).length,
    hazirlanan: bundle.categories.filter((c) => !isCategoryLive(c)).length,
    kategoriler,
  };
}

/** Yüzde — payda sıfırsa 0, "NaN%" yazmasın. */
export function yuzde(pay: number, payda: number): number {
  return payda > 0 ? Math.round((pay / payda) * 100) : 0;
}
