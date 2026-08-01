import type { EditorialAssessment, ExternalSignals, Item, ItemSignals, ItemType } from "./types";

/**
 * PUANLAMA MODELİ
 *
 * Puanın iki dayanağı vardır ve hangisinin kullanıldığı her zaman gösterilir:
 *
 * 1. **Topluluk** — kategoride yeterli oy biriktiğinde. Puan mutlak değil
 *    **göreli**: her sinyal, kaydın kendi kategorisi içindeki yüzdelik dilimine
 *    çevrilir, sonra tipe göre ağırlıklandırılır. 87 puan "kendi kategorisinde
 *    üst dilimde" demektir; robot süpürge telefonla değil robot süpürgeyle kıyaslanır.
 *
 * 2. **Dış sinyal** — topluluk verisi yokken ama dışarıdan ölçüm varsa
 *    (arama ilgisi, fiyat hareketi). Trend modelinin soğuk başlangıçta da
 *    çalışmasını sağlar. Bu ölçümler OY DEĞİLDİR; ayrı dayanak olarak
 *    etiketlenir ve kaynağı gösterilir.
 *
 * 3. **Editör** — ikisi de yoksa. Puan, editörün doğrulanabilir kriterlere
 *    verdiği notlardan gelir ve kayıt "Topluluk verisi toplanıyor" olarak
 *    işaretlenir.
 *
 * Her üç durumda da oy ve yorum sayısı ASLA üretilmez — olmayan veri sıfırdır,
 * tahmin edilmez.
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

/**
 * EDİTÖR MODELİ — topluluk verisi yokken kullanılan, doğrulanabilir kriterler.
 *
 * Buradaki her kriter belgeye, ölçüme veya yayınlanmış bilgiye dayanmalıdır.
 * "Kullanıcı memnuniyeti" bilinçli olarak yoktur: onu editör bilemez, topluluk söyler.
 */
export interface EditorCriterionDef {
  key: string;
  label: string;
  weight: number;
  hint: string;
}

export const EDITOR_MODELS: Record<ItemType, EditorCriterionDef[]> = {
  urun: [
    { key: "ozellikSeviyesi", label: "Özellik seviyesi", weight: 0.3, hint: "Teknik özelliklerin kategori içindeki yeri — yayınlanmış spesifikasyona dayanır" },
    { key: "fiyatKarsiligi", label: "Fiyat karşılığı", weight: 0.3, hint: "Aynı özellikleri veren alternatiflere göre güncel fiyat" },
    { key: "garantiDestek", label: "Garanti ve destek", weight: 0.2, hint: "Resmi garanti süresi, servis ağı, yazılım güncelleme taahhüdü" },
    { key: "erisilebilirlik", label: "Erişilebilirlik", weight: 0.1, hint: "Yetkili satıcıda bulunabilirlik ve yedek parça durumu" },
    { key: "bilgiGuvenilirligi", label: "Bilgi güvenilirliği", weight: 0.1, hint: "Kaç bağımsız kaynaktan doğrulandı, ne kadar güncel" },
  ],
  hizmet: [
    { key: "belgeDogrulama", label: "Belge doğrulaması", weight: 0.3, hint: "Yetki belgesi, sigorta poliçesi, vergi levhası görüldü mü" },
    { key: "fiyatSeffafligi", label: "Fiyat şeffaflığı", weight: 0.25, hint: "Fiyat önceden yazılı veriliyor mu, kalemler açık mı" },
    { key: "kapsamNetligi", label: "Kapsam netliği", weight: 0.2, hint: "Neyin dahil, neyin hariç olduğu sözleşmede yazıyor mu" },
    { key: "ulasilabilirlik", label: "Ulaşılabilirlik", weight: 0.15, hint: "Randevu süresi, hizmet bölgesi, iletişim kanalları" },
    { key: "isGarantisi", label: "İş garantisi", weight: 0.1, hint: "İşçilik garantisi süresi ve sorun çözüm taahhüdü" },
  ],
  mekan: [
    { key: "amacaUygunluk", label: "Amaca uygunluk", weight: 0.3, hint: "Hangi ihtiyacı ne kadar iyi karşılıyor — yerinde gözlem" },
    { key: "fiyatSeviyesi", label: "Fiyat seviyesi", weight: 0.2, hint: "Sunduğuna göre fiyat konumu" },
    { key: "erisim", label: "Erişim", weight: 0.2, hint: "Konum, ulaşım, otopark, engelli erişimi" },
    { key: "ayirtEdici", label: "Ayırt edici özellik", weight: 0.15, hint: "Benzerlerinden ayrıldığı somut nokta" },
    { key: "bilgiTazeligi", label: "Bilgi tazeliği", weight: 0.15, hint: "Saat, menü, fiyat bilgisi ne zaman doğrulandı" },
  ],
};

/** Editör kriterlerinden 0-100 mutlak puan üretir. */
export function editorialScore(type: ItemType, criteria: Record<string, number>): number {
  const model = EDITOR_MODELS[type];
  let toplam = 0;
  let agirlik = 0;
  for (const def of model) {
    const v = criteria[def.key];
    if (typeof v !== "number") continue;
    toplam += v * def.weight;
    agirlik += def.weight;
  }
  // Eksik kriter varsa kalan ağırlığa bölerek orantılıyoruz; uydurma varsayılan yok.
  return agirlik > 0 ? Math.round(toplam / agirlik) : 0;
}

export function buildEditorial(type: ItemType, criteria: Record<string, number>): EditorialAssessment {
  return { criteria, score: editorialScore(type, criteria) };
}

/**
 * DIŞ SİNYAL MODELİ — topluluk yokken trendi dışarıdan okur.
 *
 * Ağırlıklarda editörün payı kasıtlı olarak yüksek: dış ölçüm neyin
 * konuşulduğunu söyler, iyi olduğunu söylemez. Arama hacmi yüksek diye kötü bir
 * ürünü üste çıkarmak, trend sitesini magazin sayfasına çevirir.
 */
export const EXTERNAL_MODELS: Record<ItemType, EditorCriterionDef[]> = {
  urun: [
    { key: "disIvme", label: "Arama ilgisindeki artış", weight: 0.3, hint: "Son 30 günün önceki 30 güne göre arama ilgisi oranı" },
    { key: "disIlgi", label: "Arama ilgi hacmi", weight: 0.25, hint: "Kategorideki diğer kayıtlara göre aranma yoğunluğu" },
    { key: "editorNotu", label: "Editör değerlendirmesi", weight: 0.3, hint: "Doğrulanabilir kriterlere dayalı editör notu" },
    { key: "fiyatYonu", label: "Fiyat yönü", weight: 0.15, hint: "Son 30 günde ucuzlayan ürün avantajlıdır" },
  ],
  hizmet: [
    // Hizmette dış sinyal zayıftır: yerel bir ustanın arama hacmi ölçülemez.
    // Bu yüzden editör payı yarıdan fazla.
    { key: "disIvme", label: "Arama ilgisindeki artış", weight: 0.25, hint: "Son 30 günün önceki 30 güne göre arama ilgisi oranı" },
    { key: "disIlgi", label: "Arama ilgi hacmi", weight: 0.2, hint: "Kategorideki diğer kayıtlara göre aranma yoğunluğu" },
    { key: "editorNotu", label: "Editör değerlendirmesi", weight: 0.55, hint: "Belge doğrulaması ve editör kontrolü" },
  ],
  mekan: [
    { key: "disIvme", label: "Arama ilgisindeki artış", weight: 0.3, hint: "Son 30 günün önceki 30 güne göre arama ilgisi oranı" },
    { key: "disIlgi", label: "Arama ilgi hacmi", weight: 0.3, hint: "Mekânda ilgi, başlı başına sinyaldir" },
    { key: "editorNotu", label: "Editör değerlendirmesi", weight: 0.4, hint: "Yerinde gözleme dayalı editör notu" },
  ],
};

/** Yüzdeliğin tam güvenle uygulanması için kategoride gereken kayıt sayısı. */
export const MIN_COHORT = 8;

/** Bir kaydın "topluluk verisi var" sayılması için gereken en az oy sayısı. */
export const MIN_VOTES_PER_ITEM = 5;

/**
 * Kategorinin topluluk modeliyle puanlanabilmesi için kayıtların bu oranı
 * MIN_VOTES_PER_ITEM eşiğini geçmiş olmalı. Altındaysa tüm kategori editör
 * modeliyle puanlanır — yarısı göreli yarısı mutlak bir sıralama anlamsızdır.
 */
const TOPLULUK_ESIGI = 0.5;

export function hasCommunityData(item: Item): boolean {
  const s = item.signals;
  if (!s) return false;
  return s.votesUp + s.votesDown + s.votesInterest >= MIN_VOTES_PER_ITEM;
}

export function hasExternalData(item: Item): boolean {
  return item.external !== undefined;
}

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
function rawMemnuniyet(item: Item, s: ItemSignals): number {
  const { votesUp, votesDown } = s;
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
  const s = item.signals;
  // Sinyali olmayan kayıt topluluk modelinde en alttadır; bu bir ceza değil,
  // "hakkında topluluk verisi yok" durumunun dürüst karşılığıdır.
  if (!s) return key === "guncellik" ? rawGuncellik(item.updatedAt, now) : key === "editor" ? item.editorial.score : 0;
  switch (key) {
    case "topluluk":
      return rawTopluluk(s);
    case "ivme":
      return rawIvme(s);
    case "ilgi":
      return rawIlgi(s);
    case "memnuniyet":
      return rawMemnuniyet(item, s);
    case "kalicilik":
      return rawKalicilik(s);
    case "guncellik":
      return rawGuncellik(item.updatedAt, now);
    case "editor":
      return s.editor;
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

  // Kategorinin dayanağı tek seferde seçilir. Karışık dayanak (bir kayıt
  // göreli, diğeri mutlak) sıralamayı anlamsızlaştırır.
  // Öncelik: topluluk > dış sinyal > editör.
  const oyluKayit = items.filter(hasCommunityData).length;
  if (oyluKayit < Math.ceil(n * TOPLULUK_ESIGI)) {
    const disVerili = items.filter(hasExternalData).length;
    if (disVerili >= Math.ceil(n * TOPLULUK_ESIGI)) return scoreCategoryByExternal(items);
    return scoreCategoryByEditor(items, n);
  }

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
    return {
      ...item,
      score: Math.round(toplam),
      scoreBasis: "topluluk" as const,
      scoreBreakdown: breakdown,
      categoryRank: 0,
      categorySize: n,
    };
  });

  return siralamayiYaz(puanli);
}

/** Dış sinyalden ham ivme: mutlak hacim değil değişim hızı. */
function rawDisIvme(e: ExternalSignals): number {
  const oran = (e.aramaIlgi30 + 1) / (e.aramaIlgiOnceki30 + 1);
  return Math.log(Math.min(oran, 5));
}

/** Ucuzlayan ürün avantajlıdır; işareti çevirip yüksek = iyi hale getiriyoruz. */
function rawFiyatYonu(e: ExternalSignals): number {
  return -(e.fiyatDegisim30 ?? 0);
}

/**
 * Topluluk verisi yok ama dış ölçüm var: puan arama ilgisi, ivme, fiyat yönü ve
 * editör notunun kategori içi yüzdeliklerinden hesaplanır.
 *
 * Editör notu burada da yüzdeliğe çevrilir; aksi halde mutlak bir not ile göreli
 * yüzdelikler aynı toplamda karışır ve ölçek tutmaz.
 */
function scoreCategoryByExternal(items: Item[]): ScoredItem[] {
  const n = items.length;
  const model = EXTERNAL_MODELS[items[0].type];

  function ham(key: string, item: Item): number {
    const e = item.external;
    // Dış sinyali olmayan kayıt bu kohortta en altta kalır — ceza değil,
    // "hakkında ölçüm yok" durumunun karşılığı.
    if (!e) return key === "editorNotu" ? item.editorial.score : 0;
    switch (key) {
      case "disIvme":
        return rawDisIvme(e);
      case "disIlgi":
        return e.aramaIlgi30;
      case "fiyatYonu":
        return rawFiyatYonu(e);
      default:
        return item.editorial.score;
    }
  }

  const dagilim = new Map<string, number[]>();
  for (const def of model) dagilim.set(def.key, items.map((it) => ham(def.key, it)));

  const puanli: ScoredItem[] = items.map((item) => {
    const breakdown: Record<string, number> = {};
    let toplam = 0;
    for (const def of model) {
      const yuzdelik = shrink(percentileRank(dagilim.get(def.key)!, ham(def.key, item)), n);
      breakdown[def.key] = Math.round(yuzdelik);
      toplam += yuzdelik * def.weight;
    }
    return {
      ...item,
      score: Math.round(toplam),
      scoreBasis: "dis-sinyal" as const,
      scoreBreakdown: breakdown,
      categoryRank: 0,
      categorySize: n,
    };
  });

  return siralamayiYaz(puanli);
}

/**
 * Topluluk verisi olmayan kategori: puan doğrudan editör kriterlerinden gelir.
 * Yüzdelik uygulanmaz — kıyaslanacak topluluk sinyali yok, mutlak not var.
 */
function scoreCategoryByEditor(items: Item[], n: number): ScoredItem[] {
  const puanli: ScoredItem[] = items.map((item) => ({
    ...item,
    score: item.editorial.score,
    scoreBasis: "editor" as const,
    scoreBreakdown: { ...item.editorial.criteria },
    categoryRank: 0,
    categorySize: n,
  }));
  return siralamayiYaz(puanli);
}

/** Rozet koşulları kategorideki sırayı kullanır. */
function siralamayiYaz(puanli: ScoredItem[]): ScoredItem[] {
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

/** Editör puanı mutlaktır; "kategorisinde üst sırada" demek yanıltıcı olur. */
const EDITOR_TONE_LABEL: Record<ReturnType<typeof scoreTone>, string> = {
  great: "Editör notu: çok iyi",
  good: "Editör notu: iyi",
  mid: "Editör notu: ortalama",
  low: "Editör notu: zayıf",
};

export function scoreToneLabel(item: Item): string {
  const tone = scoreTone(item.score);
  return item.scoreBasis === "topluluk" ? SCORE_TONE_LABEL[tone] : EDITOR_TONE_LABEL[tone];
}

/** Puanın ne anlama geldiğini tek cümlede söyler — dayanak her yerde görünmeli. */
export function scoreBasisLabel(item: Item): { kisa: string; aciklama: string } {
  if (item.scoreBasis === "topluluk") {
    return {
      kisa: "Topluluk puanı",
      aciklama: "Ziyaretçi oyları ve ilgi sinyalleri, kategori içi yüzdeliklerle hesaplandı.",
    };
  }
  if (item.scoreBasis === "dis-sinyal") {
    const kaynak = item.external?.kaynak.label;
    return {
      kisa: "Dış sinyal",
      aciklama:
        `Bu kategoride henüz ziyaretçi oyu yok. Puan, dışarıdan ölçülen arama ilgisi ve editör notuna dayanıyor` +
        `${kaynak ? ` (kaynak: ${kaynak})` : ""}. Bu ölçümler oy değildir; oy biriktikçe topluluk puanına geçilecek.`,
    };
  }
  return {
    kisa: "Editör değerlendirmesi",
    aciklama:
      "Bu kategoride henüz yeterli ziyaretçi oyu yok. Puan, editörün doğrulanabilir kriterlerine dayanıyor; oy biriktikçe topluluk puanına geçilecek.",
  };
}

/** Kategoride yeterli kayıt yoksa puan güveni düşüktür; arayüz bunu belirtmeli. */
export function isCohortThin(size: number): boolean {
  return size < MIN_COHORT;
}
