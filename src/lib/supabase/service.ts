import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * SERVİS ROLÜ İSTEMCİSİ — RLS'i AŞAR, YALNIZCA SUNUCUDA.
 *
 * `events` tablosunda okuma bilerek admin'e kapalı: ham olay kayıtları yol,
 * hedef ve oturum içerir; herkese açık okuma, ziyaretçi davranışını dışarıya
 * açmak olurdu. Ama sosyal kanıt sayaçları (bkz. /api/etkilesim, /api/canli)
 * bu tablodan TOPLAM üretmek zorunda.
 *
 * Çözüm, politikayı gevşetmek değil: okumayı sunucuda servis anahtarıyla yapıp
 * dışarıya YALNIZCA sayı vermek. Ham satır hiçbir zaman istemciye çıkmaz.
 * `server-only` içe aktarımı, bu dosyanın kazara istemci paketine girmesini
 * derleme zamanında hata hâline getirir.
 */
export function createSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
