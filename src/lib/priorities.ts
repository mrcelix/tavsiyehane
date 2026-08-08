import type { Item, ItemType } from "./types";

export interface PriorityDef {
  /** URL'de görünen değer */
  key: string;
  label: string;
  /**
   * Sıralamada kullanılacak puan bileşeni anahtarları, tercih sırasına göre.
   * İlk bulunan kullanılır.
   */
  components: string[];
}

/**
 * Kullanıcının "en önemli önceliğim" seçimi — Tavsiye Sihirbazı bunu kullanır.
 *
 * DİKKAT: buradaki `components` değerleri scoring.ts'teki GERÇEK bileşen
 * anahtarları olmak zorunda. Önceki sürümde uydurma anahtarlar vardı
 * (`fiyatPerformans`, `uzmanlikDeneyim`…); hiçbir kayıtta bulunmadıkları için
 * sıralama sessizce hiç değişmiyordu — kullanıcı seçim yapıyor, seçim hiçbir
 * şey yapmıyordu. Etiketler de bu yüzden ölçülebilen şeye göre yazıldı: veriye
 * karşılığı olmayan bir öncelik ("Uzmanlık") sunmak, sıralamayı uydurmaktır.
 */
export const PRIORITIES: Record<ItemType, PriorityDef[]> = {
  urun: [
    { key: "fiyat-karsiligi", label: "Fiyat karşılığı", components: ["fiyatKarsiligi"] },
    { key: "ozellik", label: "En iyi özellikler", components: ["ozellikSeviyesi"] },
    { key: "garanti", label: "Garanti ve destek", components: ["garantiDestek"] },
    { key: "memnuniyet", label: "Kullanıcı memnuniyeti", components: ["memnuniyet"] },
  ],
  hizmet: [
    { key: "belge", label: "Belge doğrulaması", components: ["belgeDogrulama"] },
    { key: "fiyat-seffafligi", label: "Net fiyat", components: ["fiyatSeffafligi"] },
    { key: "ulasilabilirlik", label: "Hızlı randevu", components: ["ulasilabilirlik"] },
    { key: "kapsam", label: "Kapsam netliği", components: ["kapsamNetligi"] },
    { key: "memnuniyet", label: "Müşteri memnuniyeti", components: ["memnuniyet"] },
  ],
  mekan: [
    { key: "amac", label: "Amaca uygunluk", components: ["amacaUygunluk"] },
    { key: "fiyat-seviyesi", label: "Uygun fiyat", components: ["fiyatSeviyesi"] },
    { key: "erisim", label: "Konum ve erişim", components: ["erisim"] },
    { key: "ayirt-edici", label: "Ayırt edici özellik", components: ["ayirtEdici"] },
    { key: "memnuniyet", label: "Yorum kalitesi", components: ["memnuniyet"] },
  ],
};

export function findPriority(type: ItemType, key: string | undefined): PriorityDef | undefined {
  if (!key) return undefined;
  return PRIORITIES[type].find((p) => p.key === key);
}

/**
 * Bir kaydın seçilen öncelikteki değeri.
 *
 * İki yere bakar: `scoreBreakdown` (dayanağa göre değişir — topluluk sinyali ya
 * da editör kriteri) ve `editorial.criteria` (her kayıtta var). Yalnızca
 * breakdown'a bakmak, topluluk dayanaklı kayıtlarda editör kriterlerini
 * görünmez yapardı; o zaman "fiyat karşılığı" önceliği tam da fiyatı
 * ölçülebilen kayıtlarda çalışmazdı.
 */
export function priorityValue(item: Item, p: PriorityDef): number {
  for (const key of p.components) {
    const b = item.scoreBreakdown[key];
    if (typeof b === "number") return b;
    const c = item.editorial.criteria[key];
    if (typeof c === "number") return c;
  }
  return 0;
}
