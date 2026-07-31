import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

const GECERLI = new Set(["up", "down", "interest"]);

/**
 * Oy kaydı. Ağırlık burada hesaplanmaz — hesap yaşı ve oy çeşitliliğine dayalı
 * ağırlıklandırma veritabanı tarafında (bkz. 0002_votes.sql) yapılır; böylece
 * istemciden gelen veri ağırlığı belirleyemez.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ demo: true });

  const body = await request.json().catch(() => null);
  if (!body?.itemId || !GECERLI.has(body.kind)) {
    return NextResponse.json({ error: "Geçersiz oy" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authRequired: true });

  // Aynı kullanıcı bir kayda tek oy verir; tekrar oylarsa oyu güncellenir.
  const { error } = await supabase
    .from("votes")
    .upsert({ item_id: body.itemId, user_id: user.id, kind: body.kind }, { onConflict: "item_id,user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
