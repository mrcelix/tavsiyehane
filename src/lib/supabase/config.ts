import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Supabase anahtarları .env.local'de tanımlı mı? Değilse site demo veriyle çalışır. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * ÇEREZSİZ okuma istemcisi — yalnızca herkese açık katalog verisi için.
 *
 * `createSupabaseServer` oturumu okumak için `cookies()` kullanır ve bu yüzden
 * önbellek kapsamı içinde ÇAĞRILAMAZ (bkz. unstable_cache belgeleri: "Accessing
 * uncached data sources such as headers or cookies inside a cache scope is not
 * supported"). Katalog herkese aynı göründüğü için oturuma zaten ihtiyacı yok;
 * bu istemci o okumayı önbelleğe alınabilir hale getiriyor.
 *
 * Oturum gerektiren hiçbir sorgu bununla yapılmamalı: RLS burada anonim
 * kullanıcı olarak uygulanır.
 */
export function createSupabasePublic() {
  if (!isSupabaseConfigured()) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
