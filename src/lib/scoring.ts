import type { Item, ItemSignals, ItemType } from "./types";

/**
 * PUANLAMA MODELİ
 *
 * Puan mutlak değil **göreli**: her sinyal, kaydın kendi kategorisi içindeki
 * yüzdelik dilimine çevrilir, sonra tipe göre ağırlıklandırılır. Yani 87 puan
 * "kendi kategorisinde üst dilimde" demektir — bir robot süpürge telefonla değil,
 * diğer robot süpürgelerle kıyaslanır.
 */

export type SignalKey = "topluluk" | "ivme" | "memnuniyet" | "ilgi" | "kalicilik" | "guncellik" | "editor";

export interface SignalDef {
  key: SignalKey;
  label: string;
  weight: number; // 0-1
  hint: string;
}

/** Tipe göre ağırlıklar. Ürün trendle, hizmet güvenle, mekân canlılıkla yaşar. */
export const SCORE_MODELS: Record<ItemType, SignalDef[]> = {
  urun: [
    { key: "topluluk", label: "Topluluk oyu", weight: 0.25, hint: "Deneyenlerin ve ilgi gösterenlerin ağırlıklı net oyu" },
    { key: "ivme", label: "Yükseliş ivmesi", weight: 0.2, hint: "Son 30 günün önceki 30 güne göre ilgi artışı" },
    { key: "memnuniyet", label: "Memnuniyet", weight: 0.2, hint: "Deneyimleyenlerin verdiği puan; doğrulanmışlar ağır basar" },
    { key: "ilgi", label: "İlgi hacmi", weight: 0.15, hint: "Kaç kişi bakıyor, favoriliyor, karşılaştırıyor" },
    { key: "kalicilik", label: "Kalıcılık", weight: 0.1, hint: "Üst dilimde kalabildiği sürenin oranı" },
    { key: "guncellik", label: "Güncellik", weight: 0.05, hint: "Bilginin tazeliği" },
    { key: "editor", label: "Editör değerlendirmesi", weight: 0.05, hint: "Editör incelemesi" },
  ],
  hizmet: [
    { key: "topluluk", label: "Topluluk oyu", weight: 0.25, hint: "Deneyenlerin ve ilgi gösterenlerin ağırlıklı net oyu" },
    { key: "memnuniyet", label: "Memnuniyet", weight: 0.3, hint: "Hizmette en kritik sinyal: kötü iş parayı da zamanı da götürür" },
    { key: "kalicilik", label: "Kalıcılık", weight: 0.15, hint: "Yıllardır iyi olmak, bu ay parlamaktan değerli" },
    { key: "ivme", label: "Yükseliş ivmesi", weight: 0.1, hint: "Son dönemdeki ilgi artışı" },
    { key: "ilgi", label: "İlgi hacmi", weight: 0.1, hint: "Ne kadar çok kişi bakıyor" },
    { key: "guncellik", label: "Güncellik", weight: 0.05, hint: "Bilginin tazeliği" },
    { key: "editor", label: "Editör değerlendirmesi", weight: 0.05, hint: "Belge ve editör kontrolü" },
  ],
  mekan: [
    { key: "topluluk", label: "Topluluk oyu", weight: 0.25, hint: "Gidenlerin ve gitmek isteyenlerin ağırlıklı net oyu" },
    { key: "ilgi", label: "İlgi hacmi", weight: 0.2, hint: "Mekânda kalabalık başlı başına sinyaldir" },
    { key: "memnuniyet", label: "Memnuniyet", weight: 0.2, hint: "Gidenlerin verdiği puan" },
    { key: "ivme", label: "Yükseliş ivmesi", weight: 0.15, hint: "Son dönemde ne kadar konuşuluyor" },
    { key: "kalicilik", label: "Kalıcılık", weight: 0.1, hint: "Üst dilimde kalabildiği sürenin oranı" },
    { key: "guncellik", label: "Güncellik", weight: 0.05, hint: "Saat, menü ve bilgi tazeliği" },
    { key: "editor", label: "Editör değerlendirmesi", weight: 0.05, hint: "Editör incelemesi" },
  ],
};

/** Yüzdeliğin tam güvenle uygulanması için kategoride gereken kayıt sayısı. */
export const MIN_COHORT = 8;

// ---------- Ham sinyal hesapları ----------

/** Deneyim oyu ilgi oyundan üç kat ağır; hacim logaritmayla sönümlenir. */
function rawTopluluk(s: ItemSignals): number {
  const toplam = s.votesUp + s.votesDown + s.votesInterest;
  if (toplam === 0) return 0;
  const net = (s.votesUp - s.votesDown) * 3 + s.votesInterest;
  return net / Math.log10(toplam + 10);
}

/** Mutlak büyüklük değil değişim hızı — küçük ama yükselen, büyük ama duranı geçebilmeli. */
function rawIvme(s: ItemSignals): number {
  const oran = (s.interest30 + 1) / (s.interestPrev30 + 1);
  // Aşırı sıçramaları sınırla: beş kat artış tavan sayılır.
  return Math.log(Math.min(oran, 5));
}

function rawIlgi(s: ItemSignals): number {
  return s.interest30;
}

/** Yorum puanı ile deneyim oylarının olumlu oranı birleştirilir. */
function rawMemnuniyet(item: Item): number {
  const { votesUp, votesDown } = item.signals;
  const deneyim = votesUp + votesDown;
  const oyOrani = deneyim > 0 ? votesUp / deneyim : null;
  const yorumOrani = item.ratingCount > 0 ? item.ratingAvg / 5 : null;

  if (oyOrani === null && yorumOrani === null) return 0;
  if (oyOrani === null) return yorumOrani! * 100;
  if (yorumOrani === null) return oyOrani * 100;
  // Yorum daha derin bir sinyal olduğu için biraz daha ağır.
  return (yorumOrani * 0.6 + oyOrani * 0.4) * 100;
}

function rawKalicilik(s: ItemSignals): number {
  return s.weeksTracked > 0 ? s.weeksTop / s.weeksTracked : 0;
}

/** 45 günde yarılanan tazelik — trend sitesinde bayat içerik en büyük risk. */
function rawGuncellik(updatedAt: string, now: number): number {
  const gun = Math.max(0, (now - new Date(updatedAt).getTime()) / 86_400_000);
  return 100 * Math.pow(0.5, gun / 45);
}

function rawSignal(key: SignalKey, item: Item, now: number): number {
  switch (key) {
    case "topluluk":
      return rawTopluluk(item.signals);
    case "ivme":
      return rawIvme(item.signals);
    case "ilgi":
      return rawIlgi(item.signals);
    case "memnuniyet":
      return rawMemnuniyet(item);
    case "kalicilik":
      return rawKalicilik(item.signals);
    case "guncellik":
      return rawGuncellik(item.updatedAt, now);
    case "editor":
      return item.signals.editor;
  }
}

// ---------- Kategori içi normalizasyon ----------

/** Eşit değerleri adil paylaştıran yüzdelik sırası (0-100). */
function percentileRank(values: number[], value: number): number {
  const n = values.length;
  if (n <= 1) return 50;
  let alt = 0;
  let esit = 0;
  for (const v of values) {
    if (v < value) alt++;
    else if (v === value) esit++;
  }
  return (100 * (alt + 0.5 * esit)) / n;
}

/**
 * Küçük kategoride yüzdelik gürültülüdür; sonucu orta noktaya doğru büzeriz.
 * MIN_COHORT'a ulaşan kategoride büzülme uygulanmaz.
 */
function shrink(p: number, n: number): number {
  const guven = Math.min(1, (n - 1) / (MIN_COHORT - 1));
  return 50 + (p - 50) * guven;
}

export type ScoredItem = Item;

/**
 * Bir kategorideki kayıtları birlikte puanlar. Puan göreli olduğu için
 * tek bir kaydı tek başına puanlamak mümkün değildir — kohort gerekir.
 */
export function scoreCategory(items: Item[], now = Date.now()): ScoredItem[] {
  const n = items.length;
  if (n === 0) return [];

  const model = SCORE_MODELS[items[0].type];

  // Her sinyal için kategorideki ham değer dağılımı
  const dagilim = new Map<SignalKey, number[]>();
  for (const def of model) {
    dagilim.set(
      def.key,
      items.map((it) => rawSignal(def.key, it, now))
    );
  }

  const puanli: ScoredItem[] = items.map((item) => {
    const breakdown: Record<string, number> = {};
    let toplam = 0;
    for (const def of model) {
      const ham = rawSignal(def.key, item, now);
      const yuzdelik = shrink(percentileRank(dagilim.get(def.key)!, ham), n);
      breakdown[def.key] = Math.round(yuzdelik);
      toplam += yuzdelik * def.weight;
    }
    return { ...item, score: Math.round(toplam), scoreBreakdown: breakdown, categoryRank: 0, categorySize: n };
  });

  // Sıralama rozet koşulları için gerekli
  [...puanli]
    .sort((a, b) => b.score - a.score)
    .forEach((it, i) => {
      it.categoryRank = i + 1;
    });

  return puanli;
}

/** Tüm kayıtları kategorilerine bölüp puanlar. */
export function scoreAll(items: Item[], now = Date.now()): ScoredItem[] {
  const gruplar = new Map<string, Item[]>();
  for (const it of items) {
    const g = gruplar.get(it.categorySlug);
    if (g) g.push(it);
    else gruplar.set(it.categorySlug, [it]);
  }
  return [...gruplar.values()].flatMap((grup) => scoreCategory(grup, now));
}

// ---------- Gösterim yardımcıları ----------

export function scoreTone(score: number): "great" | "good" | "mid" | "low" {
  if (score >= 80) return "great";
  if (score >= 65) return "good";
  if (score >= 45) return "mid";
  return "low";
}

export const SCORE_TONE_LABEL: Record<ReturnType<typeof scoreTone>, string> = {
  great: "Kategorisinde üst sırada",
  good: "Kategorisinde iyi",
  mid: "Kategorisinde ortalama",
  low: "Kategorisinde geride",
};

/** Kategoride yeterli kayıt yoksa puan güveni düşüktür; arayüz bunu belirtmeli. */
export function isCohortThin(size: number): boolean {
  return size < MIN_COHORT;
}
