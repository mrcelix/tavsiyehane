import type { ItemType } from "./types";

/** Tip bazlı yorum kriterleri — genel "5 yıldız" yerine kategoriye özel değerlendirme. */
export interface ReviewCriterion {
  key: string;
  label: string;
}

export const REVIEW_CRITERIA: Record<ItemType, ReviewCriterion[]> = {
  urun: [
    { key: "kalite", label: "Kalite" },
    { key: "performans", label: "Performans" },
    { key: "dayaniklilik", label: "Dayanıklılık" },
    { key: "fiyatPerformans", label: "Fiyat-performans" },
    { key: "kullanimKolayligi", label: "Kullanım kolaylığı" },
  ],
  hizmet: [
    { key: "iletisim", label: "İletişim" },
    { key: "zamanindaTeslim", label: "Zamanında teslim" },
    { key: "iscilik", label: "İşçilik" },
    { key: "fiyatSeffafligi", label: "Fiyat şeffaflığı" },
    { key: "sorunCozme", label: "Sorun çözme" },
  ],
  mekan: [
    { key: "lezzetDeneyim", label: "Lezzet / Deneyim" },
    { key: "hizmet", label: "Hizmet" },
    { key: "temizlik", label: "Temizlik" },
    { key: "atmosfer", label: "Atmosfer" },
    { key: "fiyatPerformans", label: "Fiyat-performans" },
  ],
};
