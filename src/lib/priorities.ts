import type { ItemType } from "./types";

/**
 * Kullanıcının "en önemli önceliğim" seçimi. Değerler doğrudan puanlama modelindeki
 * bileşen anahtarlarıdır (scoring.ts) — seçim, sonuç sıralamasını o bileşene göre değiştirir.
 * Hero formu ve ihtiyaç sihirbazı aynı listeyi kullanır.
 */
export const PRIORITIES: Record<ItemType, { key: string; label: string }[]> = {
  urun: [
    { key: "fiyatPerformans", label: "Fiyat-performans" },
    { key: "teknikOzellikler", label: "En iyi özellikler" },
    { key: "kullaniciMemnuniyeti", label: "Kullanıcı memnuniyeti" },
    { key: "garantiServis", label: "Garanti ve servis" },
  ],
  hizmet: [
    { key: "dogrulanmisDegerlendirme", label: "Güvenilirlik" },
    { key: "fiyatSeffafligi", label: "Net fiyat" },
    { key: "ulasilabilirlik", label: "Hızlı randevu" },
    { key: "uzmanlikDeneyim", label: "Uzmanlık" },
  ],
  mekan: [
    { key: "amacaUygunluk", label: "Amaca uygunluk" },
    { key: "fiyatSeviyesi", label: "Uygun fiyat" },
    { key: "konum", label: "Konum" },
    { key: "degerlendirmeKalitesi", label: "Yorum kalitesi" },
  ],
};
