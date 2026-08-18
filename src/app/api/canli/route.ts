import { NextResponse } from "next/server";
import { createSupabasePublic } from "@/lib/supabase/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";

/**
 * CANLI ZİYARETÇİ SAYISI
 *
 * Son 5 dakikada belirli bir yolda görüntüleme olayı bırakan TEKİL OTURUM
 * sayısı. Oturum kimliği sekmeye özel ve kimliğe bağlanamaz (bkz. 0012);
 * onsuz bir kişinin beş kez yenilemesi beş kişi gibi görünürdü.
 *
 * `gercek: false` döndüğünde sayı ölçülmemiştir — istemci bunu bilerek karar
 * verir. Sunucu asla uydurma sayı üretmez: uydurmayı isteyen taraf istemcide
 * ve orada da açıkça "tahmini" olarak etiketlenir.
 */
export async function GET(request: Request) {
  const yol = new URL(request.url).searchParams.get("yol");
  if (!yol) return NextResponse.json({ gercek: false, sayi: 0, sebep: "yol yok" });

  const supabase = createSupabasePublic();
  if (!supabase) return NextResponse.json({ gercek: false, sayi: 0, sebep: "veritabanı yok" });

  const esik = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data, error } = await (supabase as any)
    .from("events")
    .select("oturum")
    .eq("tur", "goruntuleme")
    .eq("yol", yol.slice(0, 200))
    .gte("created_at", esik)
    .limit(2000);

  if (error) return NextResponse.json({ gercek: false, sayi: 0, sebep: "sorgu hatası" });

  const tekil = new Set((data ?? []).map((r: any) => r.oturum).filter(Boolean));
  return NextResponse.json(
    { gercek: true, sayi: tekil.size },
    // Kısa önbellek: rozet 20-40 saniyede bir soruyor, her istekte veritabanına
    // gitmesi gereksiz. 15 saniye canlılık hissini bozmuyor.
    { headers: { "cache-control": "public, max-age=15" } }
  );
}
