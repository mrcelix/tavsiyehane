import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Teklif talebi kaydı.
 *
 * Üyelik istemez: teklif almak için hesap açmak, teklif istemekten pahalıdır.
 * Spam sınırı veritabanında (0009_quotes.sql — kayıt başına saatlik tavan).
 *
 * Bu uç nokta talebi KAYDEDER, işletmeye göndermez. Arayüzdeki metin de bunu
 * söylüyor; yapmadığımız şeyi yaptık diye yazmıyoruz.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ demo: true });

  const body = await request.json().catch(() => null);
  const ad = String(body?.name ?? "").trim();
  const iletisim = String(body?.contact ?? "").trim();
  const mesaj = String(body?.message ?? "").trim();
  const itemId = String(body?.itemId ?? "").trim();

  // Kısıtlar veritabanındakiyle aynı; burada da kontrol ediliyor ki kullanıcı
  // anlaşılır bir hata görsün, ham veritabanı mesajı değil.
  if (!itemId || ad.length < 2 || iletisim.length < 5 || mesaj.length < 10) {
    return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
  }

  const { error } = await supabase.from("quote_requests").insert({
    item_id: itemId,
    name: ad.slice(0, 120),
    contact: iletisim.slice(0, 200),
    message: mesaj.slice(0, 2000),
    status: "yeni",
  });

  if (error) {
    /*
     * Tablo yoksa (migration 0009 çalıştırılmamış) kullanıcıya "gönderildi"
     * demek, formun eski hâline dönmek olur. Ne olduğunu söylüyoruz.
     */
    const tabloYok = /relation .*quote_requests.* does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: tabloYok
          ? "Teklif alma şu an kapalı. Lütfen işletmeyle doğrudan iletişime geçin."
          : "Talep kaydedilemedi. Lütfen biraz sonra tekrar deneyin.",
      },
      { status: tabloYok ? 503 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
