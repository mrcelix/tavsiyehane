import type { Item, ItemType } from "./types";

/**
 * TAZELİK POLİTİKASI
 *
 * Kayıtta `verifiedAt` alanı vardı ama hiçbir şey onu zorlamıyordu: altı ay önce
 * doğrulanmış bir fiyat, bugün doğrulanmışla aynı güvenle görünüyordu. Fiyat
 * gösterip yanlış çıkarsa kullanıcı bir daha gelmez — tazelik, bu sitede
 * doğruluk kadar temel bir mesele.
 *
 * Eşikler tipe göre farklı, çünkü bilgi aynı hızda eskimiyor:
 *   - Ürün fiyatı günlerde değişir.
 *   - Hizmet fiyat aralığı haftalarda.
 *   - Mekânın çalışma saati ve menüsü aylarda.
 *
 * Bayat kayıt gizlenmez; "bayat" olduğu SÖYLENİR. Bilgiyi saklamak, yanlış
 * bilgiyi göstermek kadar kötü — kullanıcı en azından ne kadar eskiye baktığını
 * bilerek karar verebilmeli.
 */

export type FreshnessState = "taze" | "eskiyor" | "bayat";

/** Gün cinsinden eşikler: bu günden sonra "eskiyor", bu günden sonra "bayat". */
export const FRESHNESS_DAYS: Record<ItemType, { eskiyor: number; bayat: number }> = {
  urun: { eskiyor: 7, bayat: 30 },
  hizmet: { eskiyor: 30, bayat: 90 },
  mekan: { eskiyor: 60, bayat: 180 },
};

const GUN = 86_400_000;

/** Kaydın en son ne zaman doğrulandığı — doğrulama yoksa son güncelleme tarihi. */
export function verifiedDate(item: Item): Date {
  return new Date(item.provenance.verifiedAt ?? item.updatedAt);
}

export function ageInDays(item: Item, now = Date.now()): number {
  return Math.max(0, Math.floor((now - verifiedDate(item).getTime()) / GUN));
}

export function freshnessOf(item: Item, now = Date.now()): FreshnessState {
  const gun = ageInDays(item, now);
  const esik = FRESHNESS_DAYS[item.type];
  if (gun >= esik.bayat) return "bayat";
  if (gun >= esik.eskiyor) return "eskiyor";
  return "taze";
}

export const FRESHNESS_LABEL: Record<FreshnessState, string> = {
  taze: "Güncel",
  eskiyor: "Eskiyor",
  bayat: "Doğrulama bekliyor",
};

/**
 * Kullanıcıya gösterilecek uyarı. `null` dönerse uyarı gerekmiyor demektir —
 * her kayda "kontrol edin" yazmak uyarıyı gürültüye çevirir.
 */
export function freshnessWarning(item: Item, now = Date.now()): string | null {
  const durum = freshnessOf(item, now);
  if (durum === "taze") return null;
  const gun = ageInDays(item, now);
  const ne = item.type === "urun" ? "Fiyat ve özellikler" : item.type === "hizmet" ? "Fiyat aralığı ve kapsam" : "Saatler ve menü";
  return durum === "bayat"
    ? `${ne} ${gun} gün önce doğrulandı; değişmiş olabilir.`
    : `${ne} ${gun} gün önce doğrulandı.`;
}

/** Bakım listesi: yeniden doğrulanması gerekenler, en eskisi başta. */
export function staleItems(items: Item[], now = Date.now()): Item[] {
  return items
    .filter((i) => freshnessOf(i, now) !== "taze")
    .sort((a, b) => ageInDays(b, now) - ageInDays(a, now));
}
