import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Olay kaydı — görüntülenme, tıklama, karşılaştırma.
 *
 * GİZLİLİK: IP, user-agent ve kullanıcı kimliği SAKLANMAZ. "Hangi kayıt kaç kez
 * tıklandı" sorusuna bunlar olmadan da cevap verilebiliyor; kişiye bağlanabilir
 * veri toplamak, gerekmediği hâlde risk biriktirmek olur.
 *
 * Yanıt her durumda 204: istemci tarafında hata yönetimi yapmaya değmez, olay
 * kaydı kaybolursa kullanıcı bunu hiç hissetmemeli.
 */

const GECERLI = new Set(["goruntuleme", "tiklama", "karsilastirma", "favori", "cikis", "arama"]);

export async function POST(request: Request) {
  const bos = new NextResponse(null, { status: 204 });

  const supabase = await createSupabaseServer();
  if (!supabase) return bos;

  const body = await request.json().catch(() => null);
  const tur = body?.tur;
  if (!tur || !GECERLI.has(tur)) return bos;

  try {
    await (supabase as any).from("events").insert({
      tur,
      item_id: typeof body.itemId === "string" ? body.itemId.slice(0, 120) : null,
      yol: typeof body.yol === "string" ? body.yol.slice(0, 200) : null,
      hedef: typeof body.hedef === "string" ? body.hedef.slice(0, 300) : null,
    });
  } catch {
    /* istatistik kaydı sitenin çalışmasını etkilemez */
  }

  return bos;
}
