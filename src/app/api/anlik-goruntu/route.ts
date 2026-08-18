import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBundle } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GÜNLÜK PUAN ANLIK GÖRÜNTÜSÜ
 *
 * Her kaydın o günkü puanını, sırasını, dayanağını ve bileşenlerini
 * `score_snapshots` tablosuna yazar. Vercel Cron günde bir tetikler
 * (bkz. vercel.json).
 *
 * KORUMA: `CRON_SECRET` tanımlıysa `Authorization: Bearer <secret>` şartı
 * aranır — Vercel Cron bu başlığı kendiliğinden gönderir. Tanımlı değilse uç
 * nokta KAPALIDIR; herkese açık bırakmak, geçmişi doldurup şişirmeye davet
 * olurdu.
 *
 * YAZMA service_role ile: tablonun RLS'i yalnızca okumaya açık, çünkü geçmişe
 * anonim satır eklenebilseydi geçmişin kendisi uydurulabilir olurdu.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET tanımlı değil; uç nokta kapalı." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase yazma anahtarı yok." }, { status: 503 });
  }

  const bundle = await getBundle();
  if (bundle.source !== "supabase") {
    return NextResponse.json({ error: "Demo veri; anlık görüntü alınmadı." }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const bugun = new Date().toISOString().slice(0, 10);

  const satirlar = bundle.items.map((i) => ({
    item_id: i.id,
    taken_on: bugun,
    score: i.score,
    category_rank: i.categoryRank,
    score_basis: i.scoreBasis,
    breakdown: i.scoreBreakdown,
  }));

  // Parça parça: tek istekte yüzlerce satır göndermek zaman aşımına düşer
  // (içerik aktarımıyla aynı sebep).
  let yazilan = 0;
  for (let i = 0; i < satirlar.length; i += 100) {
    const { error } = await supabase
      .from("score_snapshots")
      .upsert(satirlar.slice(i, i + 100), { onConflict: "item_id,taken_on" });
    if (error) {
      const tabloYok = /relation .*score_snapshots.* does not exist|schema cache/i.test(error.message);
      return NextResponse.json(
        { error: tabloYok ? "score_snapshots tablosu yok (0011 çalıştırılmadı)." : error.message },
        { status: tabloYok ? 503 : 500 }
      );
    }
    yazilan += satirlar.slice(i, i + 100).length;
  }

  return NextResponse.json({ ok: true, tarih: bugun, kayit: yazilan });
}
