import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * İşletme başvurusu kaydı.
 *
 * Üyelik istemez: işletme sahibinin başvurmak için önce hesap açması, başvurudan
 * pahalıdır. Spam sınırı veritabanında (0010_business_claims.sql — e-posta
 * başına saatlik tavan).
 *
 * Bu uç nokta başvuruyu KAYDEDER; belge doğrulaması ve iletişim insan işidir.
 * Arayüzdeki metin de bunu söylüyor.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ demo: true });

  const body = await request.json().catch(() => null);
  const isletme = String(body?.business ?? "").trim();
  const yetkili = String(body?.contactName ?? "").trim();
  const eposta = String(body?.email ?? "").trim();
  const telefon = String(body?.phone ?? "").trim();
  const kategori = String(body?.category ?? "").trim();
  const not = String(body?.note ?? "").trim();

  // Kısıtlar veritabanındakiyle aynı; burada da kontrol ediliyor ki kullanıcı
  // anlaşılır bir hata görsün, ham veritabanı mesajı değil.
  if (isletme.length < 2 || yetkili.length < 2 || !eposta.includes("@") || telefon.length < 7 || kategori.length < 2) {
    return NextResponse.json({ error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
  }

  const { error } = await supabase.from("business_claims").insert({
    business: isletme.slice(0, 160),
    contact_name: yetkili.slice(0, 120),
    email: eposta.slice(0, 200),
    phone: telefon.slice(0, 40),
    category: kategori.slice(0, 80),
    note: not ? not.slice(0, 2000) : null,
    status: "yeni",
  });

  if (error) {
    const tabloYok = /relation .*business_claims.* does not exist|schema cache/i.test(error.message);
    if (tabloYok) {
      return NextResponse.json(
        { error: "Başvuru alma şu an kapalı. Lütfen daha sonra tekrar deneyin." },
        { status: 503 }
      );
    }
    // Sınır mesajı doğrudan kullanıcıya döner: ne olduğunu ve ne yapacağını
    // söyleyen tek cümle o (bkz. api/teklif ile aynı yaklaşım).
    if (error.code === "23514" && /saatlik/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Başvuru kaydedilemedi. Lütfen biraz sonra tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
