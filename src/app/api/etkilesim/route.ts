import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";

/**
 * SON 24 SAATTEKİ ETKİLEŞİM
 *
 * Bir kaydın son 24 saatte kaç kez karşılaştırmaya eklendiği ve kaç kez
 * favorilendiği. İkisi de GERÇEK olaydır: düğmeler tıklandığında yazılır
 * (bkz. CompareButton, FavoriteButton) ve yalnızca EKLEME sayılır — çıkarmayı
 * da saymak ilgiyi olduğundan büyük gösterirdi.
 *
 * Uydurma sayı üretilmez. Veri yoksa sıfır döner ve rozet hiç çizilmez:
 * "0 kişi favoriledi" yazmak, sosyal kanıt olmadığını ilan etmenin en gürültülü
 * yoludur; sessiz kalmak daha dürüst ve daha zarif.
 */
export async function GET(request: Request) {
  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ karsilastirma: 0, favori: 0, gercek: false });

  const supabase = createSupabaseService();
  if (!supabase) return NextResponse.json({ karsilastirma: 0, favori: 0, gercek: false });

  const esik = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data, error } = await (supabase as any)
    .from("events")
    .select("tur")
    .eq("item_id", itemId.slice(0, 120))
    .in("tur", ["karsilastirma", "favori"])
    .gte("created_at", esik)
    .limit(5000);

  if (error) return NextResponse.json({ karsilastirma: 0, favori: 0, gercek: false });

  const karsilastirma = (data ?? []).filter((r: any) => r.tur === "karsilastirma").length;
  const favori = (data ?? []).filter((r: any) => r.tur === "favori").length;

  return NextResponse.json(
    { karsilastirma, favori, gercek: true },
    // 60 saniyelik önbellek: 24 saatlik pencere saniyede bir değişmez.
    { headers: { "cache-control": "public, max-age=60" } }
  );
}
