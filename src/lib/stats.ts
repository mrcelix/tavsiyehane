import "server-only";
import { createSupabaseServer } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Olay okuma katmanı.
 *
 * Sorgu bileşende değil burada: React bileşenleri saf olmak zorunda ve
 * `Date.now()` gibi çağrılar render sırasında yasak. Aynı sebep durum
 * sayfasında da lib/status.ts'i doğurmuştu.
 */
export interface OlayKaydi {
  tur: string;
  item_id: string | null;
  yol: string | null;
  hedef: string | null;
}

/** Son N günün olayları. Yapılandırma yoksa boş dizi — çağıran ayrım yapmasın. */
export async function sonOlaylar(gun: number, limit = 50000): Promise<OlayKaydi[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  if (!supabase) return [];

  const esik = new Date(Date.now() - gun * 86_400_000).toISOString();
  const { data, error } = await (supabase as any)
    .from("events")
    .select("tur, item_id, yol, hedef")
    .gte("created_at", esik)
    .limit(limit);

  if (error) return [];
  return (data ?? []) as OlayKaydi[];
}

/** Bir alana göre en çok tekrar eden değerler. */
export function enCok(
  olaylar: OlayKaydi[],
  alan: "item_id" | "yol" | "hedef",
  tur?: string,
  adet = 15
): [string, number][] {
  const m = new Map<string, number>();
  for (const o of olaylar) {
    if (tur && o.tur !== tur) continue;
    const k = o[alan];
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, adet);
}
