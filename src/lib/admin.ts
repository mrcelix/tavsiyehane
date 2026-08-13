import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { BUNDLE_TAG } from "./data";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServer, getCurrentProfile } from "./supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Panel ortak katmanı.
 *
 * Yetki kontrolü ve denetim kaydı tek yerde toplandı: her aksiyonun kendi
 * kontrolünü yazması, birinde unutulduğunda kimsenin fark etmemesi demek.
 * Yazma işlemi yapan her aksiyon `adminIslem` üzerinden geçer.
 */

export interface AdminOturum {
  supabase: SupabaseClient;
  userId: string;
  email: string;
}

export async function requireAdmin(): Promise<AdminOturum> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") throw new Error("Yetkisiz işlem");
  const supabase = await createSupabaseServer();
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  return { supabase: supabase as unknown as SupabaseClient, userId: profile.id, email: profile.email };
}

/**
 * Yetki + denetim kaydı + önbellek tazeleme sarmalayıcısı.
 *
 * Denetim kaydı isteğe bağlı değil: puanı ve sıralamayı etkileyen bir panelde
 * "bunu kim değiştirdi?" sorusunun cevabı yoksa, dışarıya verdiğimiz şeffaflık
 * sözü içeride karşılıksız kalır.
 */
export async function adminIslem<T>(
  eylem: string,
  hedef: { tur: string; id?: string; detay?: Record<string, unknown> },
  is: (oturum: AdminOturum) => Promise<T>,
  tazelenecek: string[] = []
): Promise<T> {
  const oturum = await requireAdmin();
  const sonuc = await is(oturum);

  // Denetim kaydı başarısız olursa asıl işlem geri alınmaz; kaydın kendisi
  // için işlemi iptal etmek, çalışan bir paneli log yüzünden durdurmak olurdu.
  try {
    await (oturum.supabase as any).from("audit_log").insert({
      actor_id: oturum.userId,
      eylem,
      hedef_tur: hedef.tur,
      hedef_id: hedef.id ?? null,
      detay: hedef.detay ?? null,
    });
  } catch {
    /* denetim kaydı yazılamadı — işlem geçerli */
  }

  /*
   * Katalog önbelleği (lib/data.ts) istekler arası ve 60 saniyelik. Yönetici
   * bir kaydı değiştirdiğinde o süreyi beklemek, panelde "kaydedildi" görüp
   * sitede eski hâli görmek demek olurdu. Etiketi burada düşürüyoruz: yazma
   * işleminin tek çıkışı bu sarmalayıcı olduğu için tek yer yeterli.
   *
   * `revalidateTag` DEĞİL `updateTag`: ilki "bayat işaretle, arka planda
   * tazele" anlamına gelir ve kaydeden yönetici bir sonraki istekte hâlâ eski
   * veriyi görür. `updateTag` bir sonraki isteği taze veri gelene kadar
   * bekletir — tam da "kendi yazdığını oku" durumu. Yalnızca Server Action
   * içinden çağrılabilir; bu sarmalayıcının tüm çağıranları öyle.
   */
  updateTag(BUNDLE_TAG);
  for (const yol of ["/panel", ...tazelenecek]) revalidatePath(yol);
  return sonuc;
}

/** Formdan gelen metin; boş string yerine null döner (veritabanı için doğrusu). */
export function metin(fd: FormData, ad: string): string | null {
  const v = fd.get(ad);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export function sayi(fd: FormData, ad: string): number | null {
  const t = metin(fd, ad);
  if (t === null) return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function isaret(fd: FormData, ad: string): boolean {
  return fd.get(ad) === "on" || fd.get(ad) === "true";
}

/** Virgül veya satır sonuyla ayrılmış listeyi diziye çevirir. */
export function liste(fd: FormData, ad: string): string[] {
  const t = metin(fd, ad);
  if (!t) return [];
  return t
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "Samsung Galaxy A56" -> "samsung-galaxy-a56" */
export function slugla(s: string): string {
  const tr: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return s
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüİ]/g, (c) => tr[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
