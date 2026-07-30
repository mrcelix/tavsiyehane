import type { ItemType } from "./types";

/**
 * Tip bazlı tavsiye puanı ağırlıkları.
 * Her bileşen 0-100 arası puanlanır; toplam puan ağırlıklı ortalamadır.
 * Bir telefonla bir diş kliniği aynı modelle sıralanmaz — her tipin kendi algoritması vardır.
 */
export interface ScoreComponent {
  key: string;
  label: string;
  weight: number; // 0-1
  hint: string;
}

export const SCORE_MODELS: Record<ItemType, ScoreComponent[]> = {
  urun: [
    { key: "fiyatPerformans", label: "Fiyat-performans", weight: 0.25, hint: "Fiyatına göre sunduğu değer" },
    { key: "kullaniciMemnuniyeti", label: "Kullanıcı memnuniyeti", weight: 0.2, hint: "Doğrulanmış kullanıcı puanları" },
    { key: "teknikOzellikler", label: "Teknik özellikler", weight: 0.15, hint: "Donanım ve özellik seviyesi" },
    { key: "saticiGuvenilirligi", label: "Satıcı güvenilirliği", weight: 0.15, hint: "Satıcıların puan ve geçmişi" },
    { key: "garantiServis", label: "Garanti ve servis", weight: 0.1, hint: "Garanti süresi ve servis ağı" },
    { key: "fiyatGuncelligi", label: "Fiyat güncelliği", weight: 0.1, hint: "Stok ve fiyat bilgisinin tazeliği" },
    { key: "editorDegerlendirmesi", label: "Editör değerlendirmesi", weight: 0.05, hint: "Editör incelemesi" },
  ],
  hizmet: [
    { key: "dogrulanmisDegerlendirme", label: "Doğrulanmış müşteri değerlendirmesi", weight: 0.25, hint: "İşlem doğrulamalı yorumlar" },
    { key: "uzmanlikDeneyim", label: "Uzmanlık ve deneyim", weight: 0.2, hint: "Alan uzmanlığı ve yıl" },
    { key: "sikayetCozumu", label: "Şikâyet çözüm oranı", weight: 0.15, hint: "Sorunları çözme performansı" },
    { key: "fiyatSeffafligi", label: "Fiyat şeffaflığı", weight: 0.15, hint: "Net ve önceden bilinen fiyat" },
    { key: "ulasilabilirlik", label: "Ulaşılabilirlik", weight: 0.1, hint: "Dönüş hızı ve randevu kolaylığı" },
    { key: "belgeDogrulama", label: "Belge ve doğrulama", weight: 0.1, hint: "Sertifika ve resmi belgeler" },
    { key: "editorKontrolu", label: "Editör kontrolü", weight: 0.05, hint: "Editör incelemesi" },
  ],
  mekan: [
    { key: "sonDonemIlgi", label: "Son dönem kullanıcı ilgisi", weight: 0.25, hint: "Yakın dönemdeki ziyaret ve yorum yoğunluğu" },
    { key: "degerlendirmeKalitesi", label: "Değerlendirme kalitesi", weight: 0.2, hint: "Yorumların derinliği ve tutarlılığı" },
    { key: "guncellik", label: "Güncellik", weight: 0.15, hint: "Bilgilerin (saat, menü, fiyat) tazeliği" },
    { key: "amacaUygunluk", label: "Kullanım amacına uygunluk", weight: 0.15, hint: "İlan edilen amaca ne kadar uyduğu" },
    { key: "fiyatSeviyesi", label: "Fiyat seviyesi", weight: 0.1, hint: "Sunduğuna göre fiyat dengesi" },
    { key: "konum", label: "Konum", weight: 0.1, hint: "Ulaşım ve çevre" },
    { key: "editorDegerlendirmesi", label: "Editör değerlendirmesi", weight: 0.05, hint: "Editör incelemesi" },
  ],
};

/** Ağırlıklı toplam puan (0-100). Eksik bileşenler 50 varsayılır. */
export function computeScore(type: ItemType, breakdown: Record<string, number>): number {
  const model = SCORE_MODELS[type];
  let total = 0;
  for (const c of model) {
    const v = breakdown[c.key] ?? 50;
    total += Math.max(0, Math.min(100, v)) * c.weight;
  }
  return Math.round(total);
}

export function scoreTone(score: number): "great" | "good" | "mid" | "low" {
  if (score >= 85) return "great";
  if (score >= 70) return "good";
  if (score >= 55) return "mid";
  return "low";
}

export const SCORE_TONE_LABEL: Record<ReturnType<typeof scoreTone>, string> = {
  great: "Çok iyi",
  good: "İyi",
  mid: "Ortalama",
  low: "Zayıf",
};
