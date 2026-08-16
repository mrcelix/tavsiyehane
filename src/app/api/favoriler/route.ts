import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getBundle } from "@/lib/data";

/**
 * FAVORİ BULUT EŞİTLEMESİ
 *
 * `favorites` tablosu ilk migration'dan beri duruyordu ama kod hiç kullanmıyordu:
 * favoriler yalnızca tarayıcıda tutuluyordu, yani cihaz değiştiren üye
 * favorilerini kaybediyordu. Üye olmanın karşılığı yoksa üyelik de olmaz.
 *
 * TASARIM: tarayıcı kaydı KALDIRILMADI. Giriş yapmamış ziyaretçi de favori
 * ekleyebilmeli; oturum açınca iki liste BİRLEŞTİRİLİR (kayıp yerine birleşim).
 * Bu yüzden GET hem okur hem gelen yerel listeyi yazar.
 *
 * Tablo `item_id` tutuyor, slug değil. Slug↔id eşlemesi katalogdan yapılıyor;
 * böylece istemci id bilmek zorunda kalmıyor.
 */

export async function GET() {
  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ demo: true, favoriler: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authRequired: true, favoriler: [] });

  const { data, error } = await supabase.from("favorites").select("item_id");
  if (error) return NextResponse.json({ error: error.message, favoriler: [] }, { status: 500 });

  const bundle = await getBundle();
  const idIle = new Map(bundle.items.map((i) => [i.id, i]));
  const favoriler = (data ?? [])
    .map((f) => idIle.get(f.item_id))
    .filter(Boolean)
    .map((i) => ({ slug: i!.slug, type: i!.type, title: i!.title }));

  return NextResponse.json({ favoriler });
}

/**
 * Yerel listeyi buluta birleştirir ve birleşmiş listeyi döndürür.
 * Gövde: `{ slugs: string[] }` — istemcideki tüm favoriler.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ demo: true, favoriler: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authRequired: true, favoriler: [] });

  const body = await request.json().catch(() => null);
  const slugs: string[] = Array.isArray(body?.slugs) ? body.slugs.filter((s: unknown) => typeof s === "string") : [];

  const bundle = await getBundle();
  const slugIle = new Map(bundle.items.map((i) => [i.slug, i]));

  /*
   * Silme de eşitlenmeli, yoksa bir cihazda kaldırılan favori diğerinden geri
   * gelir. İstemci her zaman TAM listeyi gönderiyor; sunucu da tam listeyi
   * yazıyor: önce kullanıcının satırları siliniyor, sonra gelenler ekleniyor.
   */
  const idler = slugs.map((s) => slugIle.get(s)?.id).filter(Boolean) as string[];

  const { error: silHata } = await supabase.from("favorites").delete().eq("user_id", user.id);
  if (silHata) return NextResponse.json({ error: silHata.message }, { status: 500 });

  if (idler.length > 0) {
    const { error } = await supabase
      .from("favorites")
      .insert(idler.map((item_id) => ({ user_id: user.id, item_id })));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const idIle = new Map(bundle.items.map((i) => [i.id, i]));
  return NextResponse.json({
    favoriler: idler.map((id) => idIle.get(id)!).map((i) => ({ slug: i.slug, type: i.type, title: i.title })),
  });
}
