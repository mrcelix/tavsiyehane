import { cache } from "react";
import { createSupabasePublic } from "./supabase/config";
import { SCORE_MODELS, EDITOR_MODELS, EXTERNAL_MODELS } from "./scoring";
import type { Item, ItemType } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * PUAN GÜNLÜĞÜ — okuma katmanı.
 *
 * Site "sıralamalar her gün yeniden hesaplanır" diyor; bu, o cümlenin
 * kanıtlanabilir hâli. `score_snapshots` günlük anlık görüntüleri tutuyor
 * (bkz. 0011 ve api/anlik-goruntu).
 *
 * NEDEN BİLEŞEN FARKI DA HESAPLANIYOR: "84'tü, 82 oldu" bir bilgi ama eksik
 * bilgi. Asıl anlatan cümle "fiyat karşılığı 8 puan düştü" — puanın neden
 * değiştiğini söyleyen tek şey bileşen farkı.
 */

export interface PuanNoktasi {
  tarih: string;
  puan: number;
  sira: number;
}

export interface PuanGecmisi {
  noktalar: PuanNoktasi[];
  /** İlk ve son nokta arasındaki fark. */
  fark: number;
  /** En çok oynayan bileşen — puanın neden değiştiğini anlatan şey. */
  baskinBilesen: { etiket: string; fark: number } | null;
}

/** Bileşen anahtarını okunur etikete çevirir; hangi modelde olduğunu bilmeye gerek yok. */
export function bilesenEtiketi(type: ItemType, key: string): string {
  for (const model of [SCORE_MODELS[type], EDITOR_MODELS[type], EXTERNAL_MODELS[type]]) {
    const d = model?.find((x) => x.key === key);
    if (d) return d.label;
  }
  return key;
}

/**
 * Bir kaydın son N günlük geçmişi. Tablo yoksa ya da hiç kayıt yoksa `null`
 * döner — özellik yeni kurulduğunda geçmiş boştur ve bu bir hata değildir.
 */
export const puanGecmisi = cache(async (item: Item, gun = 30): Promise<PuanGecmisi | null> => {
  const supabase = createSupabasePublic();
  if (!supabase) return null;

  const esik = new Date(Date.now() - gun * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabase as any)
    .from("score_snapshots")
    .select("taken_on, score, category_rank, breakdown")
    .eq("item_id", item.id)
    .gte("taken_on", esik)
    .order("taken_on");

  // Tablo yoksa (0011 çalıştırılmadı) sessizce geçmişsiz devam edilir: detay
  // sayfası bir grafik yüzünden açılmamazlık etmemeli.
  if (error || !data || data.length < 2) return null;

  const noktalar: PuanNoktasi[] = data.map((r: any) => ({
    tarih: r.taken_on,
    puan: r.score,
    sira: r.category_rank,
  }));

  const ilk = data[0];
  const son = data[data.length - 1];

  const baskin = baskinBilesenBul(item.type, (ilk.breakdown ?? {}) as Record<string, number>, (son.breakdown ?? {}) as Record<string, number>);

  return { noktalar, fark: son.score - ilk.score, baskinBilesen: baskin };
});

/**
 * İki bileşen kümesi arasında EN ÇOK oynayanı bulur.
 *
 * Ayrı ve saf tutuluyor çünkü özelliğin asıl iddiası bu: "puan düştü" değil,
 * "şu bileşen yüzünden düştü". Veritabanı olmadan test edilebilmesi gerekiyor.
 *
 * Değişmeyen bileşen aday değildir; eşitlikte ilk gelen kazanır (kararlı
 * sonuç, rastgele değil).
 */
export function baskinBilesenBul(
  type: ItemType,
  ilk: Record<string, number>,
  son: Record<string, number>
): { etiket: string; fark: number } | null {
  let baskin: { etiket: string; fark: number } | null = null;
  for (const key of new Set([...Object.keys(ilk), ...Object.keys(son)])) {
    const d = Math.round((son[key] ?? 0) - (ilk[key] ?? 0));
    if (d !== 0 && (!baskin || Math.abs(d) > Math.abs(baskin.fark))) {
      baskin = { etiket: bilesenEtiketi(type, key), fark: d };
    }
  }
  return baskin;
}
