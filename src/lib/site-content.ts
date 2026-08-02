import "server-only";
import { createSupabaseServer } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Panelden yönetilen site metinleri.
 *
 * Kodda bir VARSAYILAN tutulur ve veritabanı boşken o kullanılır. Panelden
 * yönetilen bir alanın kodda karşılığı olmazsa, veritabanı boş olduğu an site
 * metinsiz kalır — kurulumun yarım kaldığı ilk gün en kötü izlenimi bırakır.
 */
export interface HeroIcerik {
  ustEtiket: string;
  baslik: string;
  altBaslik: string;
  vurgular: string[];
}

export const HERO_VARSAYILAN: HeroIcerik = {
  ustEtiket: "Her konuda doğru tavsiye",
  baslik: "Ne alacağına, kimi seçeceğine, nereye gideceğine kolay karar ver",
  altBaslik:
    "Ürün, hizmet ve mekânları kendi kategorisinde değerlendiriyoruz. Puanın neye dayandığı her kayıtta yazıyor.",
  vurgular: ["Tavsiye puanı satılmaz", "Sponsorlu içerik ayrı işaretlenir", "Puanın dayanağı her zaman görünür"],
};

/** Bir ayarı okur; yoksa varsayılana düşer. */
export async function ayarOku<T>(anahtar: string, varsayilan: T): Promise<T> {
  if (!isSupabaseConfigured()) return varsayilan;
  const supabase = await createSupabaseServer();
  if (!supabase) return varsayilan;

  const { data, error } = await (supabase as any)
    .from("site_settings")
    .select("deger")
    .eq("anahtar", anahtar)
    .maybeSingle();

  if (error || !data?.deger) return varsayilan;
  return data.deger as T;
}

export function heroOku(): Promise<HeroIcerik> {
  return ayarOku("hero", HERO_VARSAYILAN);
}
