import { EDITOR_MODELS } from "./scoring";
import type { Item, ItemType } from "./types";

/**
 * "SENİN PUANIN" — kullanıcının kendi ağırlıklarıyla hesaplanan puan.
 *
 * Site puanlama ağırlıklarını zaten yayımlıyor (metodoloji sayfası). Bu özellik
 * o yayını bir iddia olmaktan çıkarıp kanıta çeviriyor: ağırlıkları oynatınca
 * sıralama gerçekten değişiyor.
 *
 * RESMİ PUANA DOKUNULMUYOR. Kaydın `score` alanı olduğu gibi kalır; bu ikinci
 * ve açıkça etiketlenmiş bir sayıdır. Karıştırılırsa faydası zararına döner —
 * arayüzde ikisi hep yan yana ve adlarıyla gösteriliyor.
 *
 * HANGİ VERİ: editör kriterleri (`editorial.criteria`). Her kayıtta var ve
 * 0-100 arası; topluluk sinyali olmayan kayıtlarda da bulunur, dolayısıyla
 * özellik soğuk başlangıçtan etkilenmiyor.
 */

/**
 * URL parametreleri: `ag.fiyatKarsiligi=40&ag.garantiDestek=30`
 *
 * Alan başına ayrı parametre, çünkü panel düz bir GET formu: JavaScript
 * olmadan da çalışır, geri tuşuyla çalışır ve adres paylaşılabilir. Tek bir
 * birleşik parametre (`ag=k:v,k:v`) form ile üretilemezdi.
 */
export const AGIRLIK_ONEK = "ag.";

export type Agirliklar = Record<string, number>;

/** Bir tipin yayımlanmış ağırlıkları, yüzde olarak (toplamı 100). */
export function yayimlanmisAgirliklar(type: ItemType): Agirliklar {
  const out: Agirliklar = {};
  for (const d of EDITOR_MODELS[type]) out[d.key] = Math.round(d.weight * 100);
  return out;
}

/**
 * URL'den ağırlıkları okur. Tanınmayan anahtar ve aralık dışı değer atılır:
 * elle kurcalanmış bir adres yüzünden puan uydurulmasın.
 */
export function agirlikOku(
  searchParams: Record<string, string | string[] | undefined>,
  type: ItemType
): Agirliklar | null {
  const gecerli = new Set(EDITOR_MODELS[type].map((d) => d.key));
  const out: Agirliklar = {};
  for (const [ad, ham] of Object.entries(searchParams)) {
    if (!ad.startsWith(AGIRLIK_ONEK)) continue;
    const k = ad.slice(AGIRLIK_ONEK.length);
    const n = Number(typeof ham === "string" ? ham : "");
    if (!gecerli.has(k) || !Number.isFinite(n) || n < 0 || n > 100) continue;
    out[k] = Math.round(n);
  }
  const toplam = Object.values(out).reduce((a, b) => a + b, 0);
  // Hepsi sıfırsa bölme yapılamaz; kullanıcı hiçbir şeyi önemsemiyorsa
  // yayımlanmış sıralama geçerli kalır.
  return Object.keys(out).length > 0 && toplam > 0 ? out : null;
}

/**
 * Kişisel puan. `editorialScore` ile aynı formül, ağırlıklar kullanıcıdan.
 * Eksik kriter varsa kalan ağırlığa bölünür — uydurma varsayılan yok.
 */
export function kisiselPuan(item: Item, agirliklar: Agirliklar): number {
  let toplam = 0;
  let agirlikToplami = 0;
  for (const [key, w] of Object.entries(agirliklar)) {
    const v = item.editorial.criteria[key];
    if (typeof v !== "number" || w <= 0) continue;
    toplam += v * w;
    agirlikToplami += w;
  }
  return agirlikToplami > 0 ? Math.round(toplam / agirlikToplami) : item.score;
}
