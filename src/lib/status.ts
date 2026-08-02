import { createSupabaseServer } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { getBundle } from "./data";
import { liveCategories } from "./categories";
import { ageInDays, freshnessOf, staleItems } from "./freshness";
import type { Item } from "./types";

/**
 * SİSTEM DURUMU
 *
 * Hem `/api/durum` (JSON) hem `/durum` (sayfa) buradan okur. İkisinin ayrı ayrı
 * ölçüm yapması, iki farklı cevap üretme riski demekti — sağlık kontrolünün
 * kendisi güvenilmez olursa hiçbir işe yaramaz.
 *
 * Ölçüm burada yapılır, bileşende değil: React bileşenleri saf olmak zorunda ve
 * `Date.now()` gibi çağrılar render sırasında yasak.
 *
 * GİZLİLİK: hiçbir anahtar, anahtar parçası veya bağlantı adresi dönmez. Ortam
 * değişkenleri yalnızca VAR/YOK olarak raporlanır — durum sayfası herkese
 * açıktır ve bir sır sızdırırsa en kolay bulunan yer olur.
 */
export interface SystemStatus {
  ok: boolean;
  ortam: string;
  bolge: string | null;
  surum: string | null;
  veriKaynagi: "supabase" | "demo";
  degiskenler: { ad: string; etiket: string; tanimli: boolean }[];
  veritabani: {
    baglanti: "ok" | "hata" | "yapilandirilmadi";
    sureMs: number | null;
    kayitSayisi: number | null;
    hata?: string;
  };
  katalog: {
    kategori: number;
    hazirlanan: number;
    kayit: number;
    gercekKayit: number;
    dogrulamaBekleyen: number;
  };
  bekleyenler: { slug: string; title: string; gun: number }[];
  eksikler: string[];
}

export async function collectStatus(): Promise<SystemStatus> {
  const degiskenler = [
    { ad: "NEXT_PUBLIC_SUPABASE_URL", etiket: "Supabase adresi", tanimli: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { ad: "NEXT_PUBLIC_SUPABASE_ANON_KEY", etiket: "Supabase anahtarı", tanimli: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { ad: "NEXT_PUBLIC_CAPTCHA_SITE_KEY", etiket: "Bot koruması (captcha)", tanimli: Boolean(process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY) },
    { ad: "NEXT_PUBLIC_SITE_URL", etiket: "Site adresi", tanimli: Boolean(process.env.NEXT_PUBLIC_SITE_URL) },
  ];

  const veritabani: SystemStatus["veritabani"] = {
    baglanti: "yapilandirilmadi",
    sureMs: null,
    kayitSayisi: null,
  };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    if (supabase) {
      // Süre de ölçülür: "cevap veriyor" ile "hızlı cevap veriyor" farklı
      // şeylerdir ve yavaşlama arızadan önce gelir.
      const t0 = Date.now();
      const { count, error } = await supabase.from("items").select("id", { count: "exact", head: true });
      veritabani.sureMs = Date.now() - t0;
      if (error) {
        veritabani.baglanti = "hata";
        veritabani.hata = error.message;
      } else {
        veritabani.baglanti = "ok";
        veritabani.kayitSayisi = count ?? 0;
      }
    }
  }

  const bundle = await getBundle();
  const yayindaki = liveCategories(bundle.categories);
  const gercek = bundle.items.filter((i: Item) => i.provenance.kind === "editor");
  const bekleyen = staleItems(gercek).filter((i) => freshnessOf(i) === "bayat");

  const eksikler: string[] = [];
  if (!degiskenler[0].tanimli || !degiskenler[1].tanimli) {
    eksikler.push("Supabase anahtarları tanımlı değil; site yerleşik veriyle çalışıyor.");
  }
  if (!degiskenler[2].tanimli) eksikler.push("Captcha site anahtarı yok; kayıtta bot doğrulaması kapalı.");
  if (!degiskenler[3].tanimli) eksikler.push("Site adresi tanımlı değil; mutlak bağlantılar tahmin ediliyor.");
  if (veritabani.baglanti === "hata") eksikler.push("Veritabanına ulaşılamıyor.");
  if (bekleyen.length > 0) eksikler.push(`${bekleyen.length} kayıt yeniden doğrulama bekliyor.`);

  return {
    ok: eksikler.length === 0,
    ortam: process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "uretim" : "yerel"),
    bolge: process.env.VERCEL_REGION ?? null,
    // Hangi sürümün yayında olduğunu bilmeden hata ayıklamak tahmin yürütmektir.
    surum: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    veriKaynagi: bundle.source,
    degiskenler,
    veritabani,
    katalog: {
      kategori: yayindaki.length,
      hazirlanan: bundle.categories.length - yayindaki.length,
      kayit: bundle.items.length,
      gercekKayit: gercek.length,
      dogrulamaBekleyen: bekleyen.length,
    },
    bekleyenler: bekleyen.slice(0, 20).map((i) => ({ slug: i.slug, title: i.title, gun: ageInDays(i) })),
    eksikler,
  };
}
